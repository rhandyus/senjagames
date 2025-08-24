import React, { useState } from 'react'
import { Icon } from '@iconify/react'
import { useAuth } from '../context/AuthContext'
import WinPayAPI from '../services/winpayAPI'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../config/firebase'

const PaymentModal = ({ isOpen, onClose, item, quantity = 1 }) => {
  const { user } = useAuth()
  const [selectedChannel, setSelectedChannel] = useState('BCA')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState(null)

  const winpay = new WinPayAPI()

  if (!isOpen || !item) return null

  // Handle price parsing - account.price might be a number or string, priceWithSellerFeeLabel is always a string
  const getPriceValue = () => {
    if (item.priceWithSellerFeeLabel) {
      return parseFloat(item.priceWithSellerFeeLabel.replace(/[$,]/g, ''))
    }
    if (item.price) {
      // If price is already a number, use it directly; if it's a string, parse it
      return typeof item.price === 'number'
        ? item.price
        : parseFloat(item.price.toString().replace(/[$,]/g, ''))
    }
    return 0
  }

  // Convert USD to IDR
  const convertToIDR = usdAmount => {
    const exchangeRate = parseFloat(import.meta.env.VITE_USD_TO_IDR_RATE) || 15500 // Default rate if not set
    const idrAmount = Math.round(usdAmount * exchangeRate)

    // Ensure minimum payment of 1000 IDR
    return Math.max(idrAmount, 1000)
  }

  const priceUSD = getPriceValue()
  const priceIDR = convertToIDR(priceUSD)
  const totalAmountIDR = priceIDR * quantity

  const supportedChannels = winpay.getSupportedChannels()

  const handlePayment = async () => {
    if (!user?.uid) {
      alert('User tidak terautentikasi')
      return
    }

    setIsProcessing(true)

    try {
      const paymentData = {
        customerName: user.uid, // Use user ID instead of name
        amount: totalAmountIDR, // Use IDR amount instead of USD
        channel: selectedChannel,
        itemId: item.id,
        itemTitle: item.title || 'Gaming Account',
        quantity: quantity,
        originalPriceUSD: priceUSD, // Keep original price for reference
        exchangeRate: import.meta.env.VITE_USD_TO_IDR_RATE
      }

      const result = await winpay.createVirtualAccount(paymentData)

      // Check for success codes: '2000000' (demo) or '2002700' (real API)
      if (result.responseCode === '2000000' || result.responseCode === '2002700') {
        const transactionData = {
          success: true,
          virtualAccountNo:
            result.virtualAccountData.virtualAccountNumber ||
            result.virtualAccountData.virtualAccountNo,
          virtualAccountName: result.virtualAccountData.virtualAccountName,
          expiredDate: result.virtualAccountData.expiredDate,
          amount: result.virtualAccountData.totalAmount.value,
          contractId: result.virtualAccountData.additionalInfo?.contractId,
          trxId: result.virtualAccountData.trxId,
          channel: selectedChannel,
          instructions: result.virtualAccountData.additionalInfo?.instructions,
          bankCode: result.virtualAccountData.additionalInfo?.bankCode
        }

        setPaymentResult(transactionData)

        // Add transaction to ongoing transactions in user's profile
        if (user?.uid) {
          try {
            const userRef = doc(db, 'users', user.uid)
            const ongoingTransaction = {
              trxId: transactionData.trxId,
              virtualAccountNo: transactionData.virtualAccountNo,
              virtualAccountName: transactionData.virtualAccountName,
              amount: transactionData.amount,
              channel: selectedChannel,
              status: 'pending',
              createdAt: new Date().toISOString(),
              expiredDate: transactionData.expiredDate,
              item: {
                id: item.id,
                title: item.title || 'Gaming Account',
                price: priceUSD,
                quantity: quantity
              }
            }

            await updateDoc(userRef, {
              ongoingTransactions: arrayUnion(ongoingTransaction)
            })
          } catch (error) {
            console.error('Error adding transaction to ongoing list:', error)
          }
        }
      } else {
        throw new Error(result.responseMessage || 'Payment creation failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentResult({
        success: false,
        error: error.message || 'Terjadi kesalahan dalam pembuatan pembayaran'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = amount => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatUSD = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getChannelIcon = channel => {
    const iconMap = {
      BCA: 'simple-icons:bca',
      BNI: 'simple-icons:bni',
      BRI: 'simple-icons:bri',
      MANDIRI: 'simple-icons:mandiri',
      PERMATA: 'simple-icons:permata',
      BSI: 'simple-icons:bsi',
      CIMB: 'simple-icons:cimb',
      INDOMARET: 'simple-icons:indomaret',
      ALFAMART: 'simple-icons:alfamart'
    }
    return iconMap[channel] || 'mdi:bank'
  }

  return (
    <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-800'>
          <h2 className='text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
            {paymentResult ? 'Informasi Pembayaran' : 'Pembayaran Akun'}
          </h2>
          <button onClick={onClose} className='text-gray-400 hover:text-white transition-colors'>
            <Icon icon='mdi:close' className='text-2xl' />
          </button>
        </div>

        {!paymentResult ? (
          // Payment Form
          <div className='p-6 space-y-6'>
            {/* Item Details */}
            <div className='bg-gray-800/50 rounded-lg p-4 border border-gray-700'>
              <h3 className='font-medium text-white mb-2'>Detail Pembelian</h3>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Item:</span>
                  <span className='text-white'>{item.title || 'Gaming Account'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Jumlah:</span>
                  <span className='text-white'>{quantity}x</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Harga per item:</span>
                  <div className='text-right'>
                    <div className='text-white'>{formatCurrency(priceIDR)}</div>
                    <div className='text-xs text-gray-500'>{formatUSD(priceUSD)}</div>
                  </div>
                </div>
                <div className='flex justify-between font-semibold pt-2 border-t border-gray-700'>
                  <span className='text-gray-300'>Total:</span>
                  <div className='text-right'>
                    <div className='text-purple-400'>{formatCurrency(totalAmountIDR)}</div>
                    <div className='text-xs text-gray-500'>{formatUSD(priceUSD * quantity)}</div>
                  </div>
                </div>
              </div>

              {/* Exchange Rate Info */}
              <div className='bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mt-4'>
                <div className='text-xs text-blue-300'>
                  <Icon icon='mdi:information' className='inline mr-1' />
                  Kurs: 1 USD ={' '}
                  {formatCurrency(import.meta.env.VITE_USD_TO_IDR_RATE || 15500).replace(
                    'Rp',
                    ''
                  )}{' '}
                  IDR
                </div>
              </div>
            </div>

            {/* Payment Channel Selection */}
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-3'>
                Pilih Metode Pembayaran
              </label>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {supportedChannels.map(channel => (
                  <label
                    key={channel.code}
                    className={`flex items-center p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedChannel === channel.code
                        ? 'border-purple-500 bg-purple-600/20'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <input
                      type='radio'
                      name='paymentChannel'
                      value={channel.code}
                      checked={selectedChannel === channel.code}
                      onChange={e => setSelectedChannel(e.target.value)}
                      className='sr-only'
                    />
                    <Icon
                      icon={getChannelIcon(channel.code)}
                      className='text-2xl mr-3 text-blue-400'
                    />
                    <div>
                      <div className='font-medium text-white'>{channel.name}</div>
                      <div className='text-xs text-gray-400'>{channel.type}</div>
                    </div>
                    {selectedChannel === channel.code && (
                      <Icon icon='mdi:check-circle' className='text-purple-400 ml-auto text-xl' />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing || !user?.uid}
              className='w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25'
            >
              {isProcessing ? (
                <div className='flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                  Memproses Pembayaran...
                </div>
              ) : (
                `Bayar ${formatCurrency(totalAmountIDR)}`
              )}
            </button>
          </div>
        ) : (
          // Payment Result
          <div className='p-6'>
            {paymentResult.success ? (
              <div className='text-center space-y-6'>
                {/* Demo Mode Indicator */}
                {import.meta.env.VITE_WINPAY_DEMO_MODE === 'true' && (
                  <div className='bg-blue-900/20 border border-blue-500/30 rounded-lg p-3'>
                    <div className='text-sm text-blue-300'>
                      <Icon icon='mdi:information' className='inline mr-1' />
                      🎭 Mode Demo - Tidak ada pembayaran sesungguhnya yang diproses
                    </div>
                  </div>
                )}

                <div className='bg-green-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto'>
                  <Icon icon='mdi:check-circle' className='text-3xl text-green-400' />
                </div>

                <div>
                  <h3 className='text-xl font-bold text-white mb-2'>
                    Virtual Account Berhasil Dibuat!
                  </h3>
                  <p className='text-gray-400'>
                    Silakan transfer ke nomor virtual account berikut:
                  </p>
                </div>

                <div className='bg-gray-800/50 rounded-lg p-6 border border-gray-700 space-y-4'>
                  <div className='text-center'>
                    <div className='text-sm text-gray-400 mb-1'>Nomor Virtual Account</div>
                    <div className='text-2xl font-mono font-bold text-purple-400 bg-gray-900 rounded-lg py-3 px-4 border border-gray-700'>
                      {paymentResult.virtualAccountNo}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(paymentResult.virtualAccountNo)}
                      className='text-sm text-gray-400 hover:text-purple-400 mt-2 transition-colors'
                    >
                      <Icon icon='mdi:content-copy' className='inline mr-1' />
                      Salin Nomor
                    </button>
                  </div>

                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <div className='text-gray-400'>Nama</div>
                      <div className='text-white font-medium'>
                        {paymentResult.virtualAccountName}
                      </div>
                    </div>
                    <div>
                      <div className='text-gray-400'>Jumlah</div>
                      <div className='text-white font-medium'>
                        {formatCurrency(paymentResult.amount)}
                      </div>
                    </div>
                    <div>
                      <div className='text-gray-400'>Bank</div>
                      <div className='text-white font-medium'>{paymentResult.channel}</div>
                    </div>
                    <div>
                      <div className='text-gray-400'>Berlaku Hingga</div>
                      <div className='text-white font-medium'>
                        {new Date(paymentResult.expiredDate).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='bg-blue-600/20 border border-blue-500/30 rounded-lg p-4'>
                  <div className='flex items-start'>
                    <Icon icon='mdi:information' className='text-blue-400 text-xl mr-3 mt-0.5' />
                    <div className='text-sm text-blue-200'>
                      <div className='font-medium mb-2'>
                        Cara Pembayaran {paymentResult.channel}:
                      </div>
                      {paymentResult.instructions ? (
                        <ol className='space-y-1 text-blue-300 list-decimal list-inside'>
                          {paymentResult.instructions.map((instruction, index) => (
                            <li key={index}>{instruction}</li>
                          ))}
                        </ol>
                      ) : (
                        <ul className='space-y-1 text-blue-300'>
                          <li>• Transfer ke nomor virtual account di atas</li>
                          <li>• Pembayaran akan otomatis terverifikasi</li>
                          <li>• Akun akan dikirim setelah pembayaran berhasil</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className='w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200'
                >
                  Mengerti
                </button>
              </div>
            ) : (
              // Error State
              <div className='text-center space-y-6'>
                <div className='bg-red-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto'>
                  <Icon icon='mdi:alert-circle' className='text-3xl text-red-400' />
                </div>

                <div>
                  <h3 className='text-xl font-bold text-white mb-2'>Pembayaran Gagal</h3>
                  <p className='text-gray-400'>{paymentResult.error}</p>
                </div>

                <button
                  onClick={() => {
                    setPaymentResult(null)
                    setIsProcessing(false)
                  }}
                  className='w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200'
                >
                  Coba Lagi
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentModal
