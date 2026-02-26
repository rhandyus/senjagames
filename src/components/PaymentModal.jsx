import { Icon } from '@iconify/react'
import { arrayUnion, doc, setDoc, updateDoc } from 'firebase/firestore'
import { useState } from 'react'
import { db } from '../config/firebase'
import { useAuth } from '../context/AuthContext'

const PaymentModal = ({ isOpen, onClose, item, quantity = 1 }) => {
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState(null)
  const [transferProof, setTransferProof] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  if (!isOpen || !item) return null

  // Bank Transfer Details
  const bankDetails = {
    bank: 'BCA',
    accountNumber: '7410468225',
    accountName: 'Rhandy'
  }

  // Handle price parsing - prioritize price field over priceWithSellerFeeLabel (for Steam multiplier)
  const getPriceValue = () => {
    if (item.price !== undefined && item.price !== null) {
      // If price is already a number, use it directly; if it's a string, parse it
      return typeof item.price === 'number'
        ? item.price
        : parseFloat(item.price.toString().replace(/[$,]/g, ''))
    }
    if (item.priceWithSellerFeeLabel) {
      return parseFloat(item.priceWithSellerFeeLabel.replace(/[$,]/g, ''))
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

  const handleCreateOrder = async () => {
    if (!user?.uid) {
      alert('User tidak terautentikasi')
      return
    }

    setIsProcessing(true)

    try {
      const trxId = `TRX${Date.now()}`

      // Helper to remove any undefined fields before saving to Firestore
      const removeUndefined = obj => {
        return Object.entries(obj).reduce((acc, [key, varValue]) => {
          if (varValue !== undefined) {
            if (varValue && typeof varValue === 'object' && !(varValue instanceof Date)) {
              acc[key] = removeUndefined(varValue)
            } else {
              acc[key] = varValue
            }
          }
          return acc
        }, {})
      }

      // Create bank transfer order directly in Firestore
      const rawOrderData = {
        orderId: trxId,
        customerName: user.displayName || `SENJA${user.uid.slice(0, 6).toUpperCase()}`,
        customerEmail: user.email || `${user.uid}@senjagames.id`,
        customerUid: user.uid,
        amount: totalAmountIDR,
        items: [
          {
            id: item.id || item.item_id || 'unknown_item',
            title: item.title || 'Gaming Account',
            price: priceUSD,
            quantity: quantity,
            priceIDR: priceIDR
          }
        ],
        paymentMethod: 'bank_transfer',
        bankDetails: bankDetails,
        status: 'waiting_for_payment',
        createdAt: new Date(),
        updatedAt: new Date(),
        proofUploaded: false
      }

      const orderData = removeUndefined(rawOrderData)

      await setDoc(doc(db, 'orders', trxId), orderData)

      // Add transaction to ongoing transactions in user's profile
      if (user?.uid) {
        try {
          const userRef = doc(db, 'users', user.uid)
          const rawOngoingTransaction = {
            trxId: trxId,
            orderId: trxId,
            amount: totalAmountIDR,
            status: 'waiting_for_payment',
            createdAt: new Date().toISOString(),
            item: {
              id: item.id || item.item_id || 'unknown_item',
              title: item.title || 'Gaming Account',
              price: priceUSD,
              quantity: quantity
            },
            bankDetails: bankDetails
          }

          const ongoingTransaction = removeUndefined(rawOngoingTransaction)

          await updateDoc(userRef, {
            ongoingTransactions: arrayUnion(ongoingTransaction)
          })
        } catch (error) {
          console.error('Error adding transaction to ongoing list:', error)
        }
      }

      setPaymentResult({
        success: true,
        ...orderData,
        trxId: trxId
      })
    } catch (error) {
      console.error('Order creation error:', error)
      setPaymentResult({
        success: false,
        error: error.message || 'Terjadi kesalahan dalam pembuatan pesanan'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File terlalu besar. Maksimal 5MB.')
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('Hanya file gambar yang diperbolehkan.')
        return
      }
      setTransferProof(file)
    }
  }

  const handleUploadProof = async () => {
    if (!transferProof || !paymentResult?.orderId) {
      alert('Pilih file bukti transfer terlebih dahulu')
      return
    }

    setIsUploading(true)

    try {
      // Read the file as a base64 string
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(transferProof)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
      })

      // Update the order in Firestore directly
      const orderRef = doc(db, 'orders', paymentResult.orderId)
      await updateDoc(orderRef, {
        transferProofDataUrl: base64String,
        status: 'waiting_for_confirmation',
        proofUploadedAt: new Date(),
        updatedAt: new Date(),
        proofUploaded: true
      })

      // Update payment result with upload success
      setPaymentResult(prev => ({
        ...prev,
        proofUploaded: true,
        proofUrl: base64String
      }))

      alert('Bukti transfer berhasil diupload! Admin akan memverifikasi dalam 1-2 jam.')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Gagal upload bukti transfer: ' + error.message)
    } finally {
      setIsUploading(false)
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
          // Order Creation Form
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

            {/* Payment Method Info */}
            <div className='bg-green-600/20 border border-green-500/30 rounded-lg p-4 mb-4'>
              <div className='text-sm text-green-300'>
                <Icon icon='mdi:bank-transfer' className='inline mr-1' />
                Pembayaran via Bank Transfer BCA
              </div>
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={isProcessing || !user?.uid}
              className='w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25'
            >
              {isProcessing ? (
                <div className='flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                  Membuat Pesanan...
                </div>
              ) : (
                `Buat Pesanan ${formatCurrency(totalAmountIDR)}`
              )}
            </button>
          </div>
        ) : (
          // Payment Result / Transfer Instructions
          <div className='p-6'>
            {paymentResult.success ? (
              <div className='text-center space-y-6'>
                <div className='bg-green-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto'>
                  <Icon icon='mdi:check-circle' className='text-3xl text-green-400' />
                </div>

                <div>
                  <h3 className='text-xl font-bold text-white mb-2'>Pesanan Berhasil Dibuat!</h3>
                  <p className='text-gray-400'>Silakan transfer ke rekening berikut</p>
                </div>

                {/* Bank Transfer Details */}
                <div className='bg-gray-800/50 rounded-lg p-6 border border-gray-700 space-y-4'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-white mb-2'>BANK {bankDetails.bank}</div>
                    <div className='text-3xl font-mono font-bold text-purple-400 mb-2'>
                      {bankDetails.accountNumber}
                    </div>
                    <div className='text-lg text-gray-300'>a.n {bankDetails.accountName}</div>
                  </div>

                  <div className='border-t border-gray-600 pt-4'>
                    <div className='text-center'>
                      <div className='text-gray-400 text-sm'>Jumlah Transfer</div>
                      <div className='text-2xl font-bold text-green-400'>
                        {formatCurrency(paymentResult.amount)}
                      </div>
                    </div>
                  </div>

                  <div className='text-center'>
                    <div className='text-gray-400 text-sm'>Order ID</div>
                    <div className='text-white font-mono font-medium'>{paymentResult.trxId}</div>
                  </div>
                </div>

                <div className='bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 mt-6'>
                  <div className='flex items-start'>
                    <Icon icon='mdi:information' className='text-blue-400 text-xl mr-3 mt-0.5 flex-shrink-0' />
                    <div className='text-sm text-blue-200 w-full'>
                      <div className='font-medium mb-3'>Cara Transfer:</div>
                      <ol className='space-y-1.5 text-blue-300 list-decimal ml-4 pl-1'>
                        <li className='pl-1'>Buka aplikasi banking BCA Anda</li>
                        <li className='pl-1'>Pilih menu Transfer</li>
                        <li className='pl-1'>Masukkan nomor rekening: <span className='font-mono text-purple-300'>{bankDetails.accountNumber}</span></li>
                        <li className='pl-1'>Masukkan jumlah: <span className='font-medium text-green-300'>{formatCurrency(paymentResult.amount).replace('Rp', '')}</span></li>
                        <li className='pl-1'>Konfirmasi dan transfer</li>
                        <li className='pl-1'>Upload bukti transfer di bawah ini</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Transfer Proof Upload */}
                {!paymentResult.proofUploaded ? (
                  <div className='bg-gray-800/50 rounded-lg p-4 border border-gray-700'>
                    <h4 className='font-medium text-white mb-3'>Upload Bukti Transfer</h4>

                    <div className='space-y-3'>
                      <input
                        type='file'
                        accept='image/*'
                        onChange={handleFileChange}
                        className='w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700'
                      />

                      {transferProof && (
                        <div className='text-sm text-gray-400'>
                          File: {transferProof.name} ({(transferProof.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      )}

                      <button
                        onClick={handleUploadProof}
                        disabled={!transferProof || isUploading}
                        className='w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        {isUploading ? (
                          <div className='flex items-center justify-center'>
                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                            Mengupload...
                          </div>
                        ) : (
                          'Upload Bukti Transfer'
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='bg-green-600/20 border border-green-500/30 rounded-lg p-4'>
                    <div className='flex items-center justify-center text-green-300'>
                      <Icon icon='mdi:check-circle' className='text-xl mr-2' />
                      Bukti transfer berhasil diupload! Menunggu konfirmasi admin.
                    </div>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className='w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200'
                >
                  Selesai
                </button>
              </div>
            ) : (
              // Error State
              <div className='text-center space-y-6'>
                <div className='bg-red-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto'>
                  <Icon icon='mdi:alert-circle' className='text-3xl text-red-400' />
                </div>

                <div>
                  <h3 className='text-xl font-bold text-white mb-2'>Pembuatan Pesanan Gagal</h3>
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
