import React, { useState } from 'react'
import { Icon } from '@iconify/react'
import { useAuth } from '../context/AuthContext'
import WinPayAPI from '../services/winpayAPI'
import { doc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore'
import { db } from '../config/firebase'

const PaymentDetailModal = ({ isOpen, onClose, transaction, onTransactionUpdate }) => {
  const { user } = useAuth()
  const [selectedChannel, setSelectedChannel] = useState(transaction?.channel || 'BCA')
  const [isProcessing, setIsProcessing] = useState(false)
  const [customerName, setCustomerName] = useState(
    user?.fullName || user?.email?.split('@')[0] || ''
  )

  const winpay = new WinPayAPI()

  if (!isOpen || !transaction) return null

  const supportedChannels = winpay.getSupportedChannels()

  const formatCurrency = amount => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = date => {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(date))
  }

  const getTimeRemaining = expiredDate => {
    const now = new Date()
    const expiry = new Date(expiredDate)
    const diff = expiry - now

    if (diff <= 0) return 'Sudah kadaluarsa'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours} jam ${minutes} menit lagi`
    } else {
      return `${minutes} menit lagi`
    }
  }

  const getChannelIcon = channel => {
    const iconMap = {
      BCA: 'mdi:bank',
      BNI: 'mdi:bank',
      BRI: 'mdi:bank',
      MANDIRI: 'mdi:bank',
      CIMB: 'mdi:bank',
      PERMATA: 'mdi:bank',
      BSI: 'mdi:bank'
    }
    return iconMap[channel] || 'mdi:bank'
  }

  const handleChangePaymentMethod = async () => {
    if (!customerName.trim()) {
      alert('Mohon masukkan nama untuk pembayaran')
      return
    }

    setIsProcessing(true)

    try {
      // Create new payment with different channel
      const paymentData = {
        customerName: customerName.trim(),
        amount: parseFloat(transaction.amount),
        channel: selectedChannel,
        itemId: transaction.item?.id || transaction.trxId,
        itemTitle: transaction.item?.title || 'Gaming Account',
        quantity: transaction.item?.quantity || 1,
        originalPriceUSD: transaction.item?.price || 0,
        exchangeRate: import.meta.env.VITE_USD_TO_IDR_RATE
      }

      const result = await winpay.createVirtualAccount(paymentData)

      // Check for success codes: '2000000' (demo) or '2002700' (real API)
      if (result.responseCode === '2000000' || result.responseCode === '2002700') {
        // Update transaction with new payment details
        const updatedTransaction = {
          ...transaction,
          virtualAccountNo:
            result.virtualAccountData.virtualAccountNumber ||
            result.virtualAccountData.virtualAccountNo,
          virtualAccountName: result.virtualAccountData.virtualAccountName,
          expiredDate: result.virtualAccountData.expiredDate,
          channel: selectedChannel,
          trxId: result.virtualAccountData.trxId,
          contractId: result.virtualAccountData.additionalInfo?.contractId,
          updatedAt: new Date().toISOString()
        }

        // Update in Firebase
        if (user?.uid) {
          try {
            const userRef = doc(db, 'users', user.uid)

            // Remove old transaction and add updated one
            await updateDoc(userRef, {
              ongoingTransactions: arrayRemove(transaction)
            })

            await updateDoc(userRef, {
              ongoingTransactions: arrayUnion(updatedTransaction)
            })

            // Call parent callback to update local state
            if (onTransactionUpdate) {
              onTransactionUpdate(updatedTransaction)
            }

            alert('Metode pembayaran berhasil diubah!')
            onClose()
          } catch (error) {
            console.error('Error updating transaction:', error)
            alert('Gagal memperbarui metode pembayaran. Silakan coba lagi.')
          }
        }
      } else {
        throw new Error(result.responseMessage || 'Payment creation failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Terjadi kesalahan dalam pembuatan pembayaran: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text)
    alert('Nomor Virtual Account berhasil disalin!')
  }

  const handleRetryPayment = async () => {
    if (!customerName.trim()) {
      alert('Mohon masukkan nama untuk pembayaran')
      return
    }

    setIsProcessing(true)

    try {
      // Create new payment with same channel but new VA
      const paymentData = {
        customerName: customerName.trim(),
        amount: parseFloat(transaction.amount),
        channel: transaction.channel,
        itemId: transaction.item?.id || transaction.trxId,
        itemTitle: transaction.item?.title || 'Gaming Account',
        quantity: transaction.item?.quantity || 1,
        originalPriceUSD: transaction.item?.price || 0,
        exchangeRate: import.meta.env.VITE_USD_TO_IDR_RATE
      }

      const result = await winpay.createVirtualAccount(paymentData)

      if (result.responseCode === '2000000' || result.responseCode === '2002700') {
        const updatedTransaction = {
          ...transaction,
          virtualAccountNo:
            result.virtualAccountData.virtualAccountNumber ||
            result.virtualAccountData.virtualAccountNo,
          virtualAccountName: result.virtualAccountData.virtualAccountName,
          expiredDate: result.virtualAccountData.expiredDate,
          trxId: result.virtualAccountData.trxId,
          contractId: result.virtualAccountData.additionalInfo?.contractId,
          updatedAt: new Date().toISOString(),
          status: 'pending'
        }

        // Update in Firebase
        if (user?.uid) {
          try {
            const userRef = doc(db, 'users', user.uid)

            await updateDoc(userRef, {
              ongoingTransactions: arrayRemove(transaction)
            })

            await updateDoc(userRef, {
              ongoingTransactions: arrayUnion(updatedTransaction)
            })

            if (onTransactionUpdate) {
              onTransactionUpdate(updatedTransaction)
            }

            alert('Virtual Account baru berhasil dibuat!')
            // Don't close modal, show updated transaction details
          } catch (error) {
            console.error('Error updating transaction:', error)
            alert('Gagal memperbarui transaksi. Silakan coba lagi.')
          }
        }
      } else {
        throw new Error(result.responseMessage || 'Payment retry failed')
      }
    } catch (error) {
      console.error('Retry payment error:', error)
      alert('Terjadi kesalahan dalam membuat pembayaran baru: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDateTime = dateString => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired = transaction.expiredDate && new Date(transaction.expiredDate) < new Date()

  return (
    <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-800'>
          <h2 className='text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
            Detail Pembayaran
          </h2>
          <button onClick={onClose} className='text-gray-400 hover:text-white transition-colors'>
            <Icon icon='mdi:close' className='text-2xl' />
          </button>
        </div>

        <div className='p-6 space-y-6'>
          {/* Transaction Info */}
          <div className='bg-gray-800/50 rounded-lg p-4 border border-gray-700'>
            <h3 className='font-medium text-white mb-3 flex items-center'>
              <Icon icon='mdi:receipt' className='mr-2 text-purple-400' />
              Informasi Transaksi
            </h3>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-400'>ID Transaksi:</span>
                <span className='text-white font-mono'>{transaction.trxId}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Waktu Dibuat:</span>
                <span className='text-white'>{formatDateTime(transaction.createdAt)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Item:</span>
                <span className='text-white font-medium'>
                  {transaction.item?.title || 'Gaming Account'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Jumlah:</span>
                <span className='text-white'>{transaction.item?.quantity || 1}x</span>
              </div>
              {transaction.item?.price && (
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Harga per Item:</span>
                  <span className='text-white'>${transaction.item.price}</span>
                </div>
              )}
              <div className='flex justify-between border-t border-gray-700 pt-2'>
                <span className='text-gray-400 font-medium'>Total Pembayaran:</span>
                <span className='text-purple-400 font-bold text-lg'>
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Status:</span>
                <span
                  className={`font-medium px-2 py-1 rounded text-xs ${
                    isExpired
                      ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                      : transaction.status === 'completed'
                        ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                        : 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                  }`}
                >
                  {isExpired
                    ? 'Kadaluarsa'
                    : transaction.status === 'completed'
                      ? 'Selesai'
                      : 'Menunggu Pembayaran'}
                </span>
              </div>
            </div>
          </div>

          {/* Current Payment Details */}
          <div className='bg-gray-800/50 rounded-lg p-4 border border-gray-700'>
            <h3 className='font-medium text-white mb-3 flex items-center'>
              <Icon icon='mdi:credit-card' className='mr-2 text-blue-400' />
              Detail Pembayaran Saat Ini
            </h3>

            {/* Virtual Account Number */}
            <div className='text-center mb-6'>
              <div className='text-sm text-gray-400 mb-2'>Nomor Virtual Account</div>
              <div className='text-3xl font-mono font-bold text-purple-400 bg-gray-900 rounded-lg py-4 px-4 border border-gray-700 mb-3'>
                {transaction.virtualAccountNo}
              </div>
              <button
                onClick={() => copyToClipboard(transaction.virtualAccountNo)}
                className='inline-flex items-center text-sm text-gray-400 hover:text-purple-400 transition-colors bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-lg border border-gray-700'
              >
                <Icon icon='mdi:content-copy' className='mr-1' />
                Salin Nomor
              </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4'>
              <div className='bg-gray-900/50 rounded-lg p-3 border border-gray-700'>
                <div className='text-gray-400 text-xs mb-1'>Nama Virtual Account</div>
                <div className='text-white font-medium'>{transaction.virtualAccountName}</div>
              </div>
              <div className='bg-gray-900/50 rounded-lg p-3 border border-gray-700'>
                <div className='text-gray-400 text-xs mb-1'>Bank</div>
                <div className='text-white font-medium uppercase'>{transaction.channel}</div>
              </div>
              <div className='bg-gray-900/50 rounded-lg p-3 border border-gray-700 md:col-span-2'>
                <div className='text-gray-400 text-xs mb-1'>Berlaku Hingga</div>
                <div className={`font-medium ${isExpired ? 'text-red-400' : 'text-white'}`}>
                  {formatDateTime(transaction.expiredDate)}
                </div>
                {!isExpired && (
                  <div className='text-xs text-yellow-400 mt-1'>
                    ⏰ {getTimeRemaining(transaction.expiredDate)}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className='flex flex-wrap gap-2'>
              <button
                onClick={() => copyToClipboard(transaction.amount.toString())}
                className='flex-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
              >
                <Icon icon='mdi:content-copy' className='mr-1' />
                Salin Nominal
              </button>
              <button
                onClick={() =>
                  copyToClipboard(
                    `${transaction.virtualAccountNo}\n${formatCurrency(transaction.amount)}\nBank: ${transaction.channel}`
                  )
                }
                className='flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
              >
                <Icon icon='mdi:share' className='mr-1' />
                Salin Semua
              </button>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className='bg-blue-600/20 border border-blue-500/30 rounded-lg p-4'>
            <div className='flex items-start'>
              <Icon icon='mdi:information' className='text-blue-400 text-xl mr-3 mt-0.5' />
              <div className='text-sm text-blue-200'>
                <div className='font-medium mb-2'>Cara Pembayaran {transaction.channel}:</div>
                <ol className='space-y-1 text-blue-300 list-decimal list-inside'>
                  <li>Transfer ke nomor virtual account di atas</li>
                  <li>Pastikan nominal transfer sesuai dengan yang tertera</li>
                  <li>Pembayaran akan otomatis terverifikasi</li>
                  <li>Akun akan dikirim setelah pembayaran berhasil</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {isExpired && (
            <div className='bg-red-600/20 border border-red-500/30 rounded-lg p-4'>
              <div className='flex items-start'>
                <Icon icon='mdi:alert-circle' className='text-red-400 text-xl mr-3 mt-0.5' />
                <div className='text-sm text-red-200'>
                  <div className='font-medium mb-2'>Virtual Account Kadaluarsa</div>
                  <p className='text-red-300 mb-3'>
                    Virtual Account ini sudah kadaluarsa. Anda dapat membuat virtual account baru
                    dengan metode pembayaran yang sama atau berbeda.
                  </p>
                  <button
                    onClick={handleRetryPayment}
                    disabled={isProcessing || !customerName.trim()}
                    className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isProcessing ? (
                      <div className='flex items-center'>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                        Membuat VA Baru...
                      </div>
                    ) : (
                      <>
                        <Icon icon='mdi:refresh' className='mr-1' />
                        Buat VA Baru
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Change Payment Method Section */}
          <div className='bg-gray-800/50 rounded-lg p-4 border border-gray-700'>
            <h3 className='font-medium text-white mb-3 flex items-center'>
              <Icon icon='mdi:swap-horizontal' className='mr-2 text-orange-400' />
              Ubah Metode Pembayaran
            </h3>

            {/* Customer Name */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-300 mb-2'>Nama Lengkap</label>
              <input
                type='text'
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className='w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors'
                placeholder='Masukkan nama lengkap'
                required
              />
            </div>

            {/* Payment Channel Selection */}
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-3'>
                Pilih Metode Pembayaran Baru
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

            {/* Change Payment Button */}
            <button
              onClick={handleChangePaymentMethod}
              disabled={
                isProcessing || !customerName.trim() || selectedChannel === transaction.channel
              }
              className='w-full mt-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25'
            >
              {isProcessing ? (
                <div className='flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                  Membuat Pembayaran Baru...
                </div>
              ) : selectedChannel === transaction.channel ? (
                'Pilih metode pembayaran yang berbeda'
              ) : (
                `Buat VA Baru dengan ${selectedChannel}`
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-3'>
            <button
              onClick={onClose}
              className='flex-1 bg-gray-800 text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors border border-gray-700'
            >
              Tutup
            </button>

            {!isExpired && (
              <>
                <button
                  onClick={() => copyToClipboard(transaction.virtualAccountNo)}
                  className='flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-green-500/25'
                >
                  <Icon icon='mdi:content-copy' className='inline mr-2' />
                  Salin VA
                </button>

                <button
                  onClick={handleRetryPayment}
                  disabled={isProcessing || !customerName.trim()}
                  className='flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25'
                >
                  {isProcessing ? (
                    <div className='flex items-center justify-center'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Membuat...
                    </div>
                  ) : (
                    <>
                      <Icon icon='mdi:refresh' className='inline mr-2' />
                      Perpanjang VA
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentDetailModal
