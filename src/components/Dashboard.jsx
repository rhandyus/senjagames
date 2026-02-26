import { Icon } from '@iconify/react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db } from '../config/firebase'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('purchased')

  // Transaction Modal States
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [transferProof, setTransferProof] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            setUserData(userDoc.data())
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
      setLoading(false)
    }

    fetchUserData()
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleTransactionClick = transaction => {
    setSelectedTransaction({
       ...transaction,
       bankDetails: transaction.bankDetails || {
         bank: 'BCA',
         accountNumber: '7410468225',
         accountName: 'Rhandy'
       }
    })
    setTransferProof(null)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
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
    if (!transferProof || !selectedTransaction?.orderId) {
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
      const orderRef = doc(db, 'orders', selectedTransaction.orderId)
      await updateDoc(orderRef, {
        transferProofDataUrl: base64String,
        status: 'waiting_for_confirmation',
        proofUploadedAt: new Date(),
        updatedAt: new Date(),
        proofUploaded: true
      })

      // Update the transaction in user's profile
      if (user?.uid) {
        const userRef = doc(db, 'users', user.uid)

        // Fetch fresh copy of user doc to ensure atomic-like array replacement
        const userDoc = await getDoc(userRef)

        if (userDoc.exists() && userDoc.data().ongoingTransactions) {
          const remoteTransactions = userDoc.data().ongoingTransactions

          const updatedTransactions = remoteTransactions.map(t =>
            t.trxId === selectedTransaction.trxId
              ? { ...t, status: 'waiting_for_confirmation' }
              : t
          )

          await updateDoc(userRef, {
            ongoingTransactions: updatedTransactions
          })

          // Update local state
          setUserData(prev => ({
            ...prev,
            ongoingTransactions: updatedTransactions
          }))
        }

        setSelectedTransaction(prev => ({ ...prev, status: 'waiting_for_confirmation' }))
      }

      alert('Bukti transfer berhasil diupload! Admin akan memverifikasi dalam 1-2 jam.')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Gagal upload bukti transfer: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleTransactionUpdate = updatedTransaction => {
    // Update the transaction in the userData state
    if (userData && userData.ongoingTransactions) {
      const updatedTransactions = userData.ongoingTransactions.map(t =>
        t.trxId === updatedTransaction.trxId ? updatedTransaction : t
      )
      setUserData({
        ...userData,
        ongoingTransactions: updatedTransactions
      })
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-r from-black via-gray-900 to-black flex items-center justify-center'>
        <div className='bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-lg p-8 shadow-xl'>
          <div className='flex items-center space-x-4'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500'></div>
            <span className='text-white text-lg'>Loading dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  const purchasedAccounts = userData?.purchasedAccounts || []
  const ongoingTransactions = userData?.ongoingTransactions || []
  const paymentHistory = userData?.paymentHistory || []

  return (
    <div className='min-h-screen bg-gradient-to-r from-black via-gray-900 to-black'>
      {/* Header */}
      <header className='bg-gray-900/80 backdrop-blur-md border-b border-gray-800 shadow-xl sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            {/* Logo with Home Link */}
            <div className='flex items-center'>
              <Link
                to='/'
                className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-pink-300 transition-all duration-200'
              >
                SenjaGames.id
              </Link>
            </div>

            {/* Navigation */}
            <div className='flex items-center'>
              <div className='flex items-center space-x-2 sm:space-x-4'>
                {/* Welcome message - hidden on mobile */}
                <div className='hidden lg:block'>
                  <span className='text-gray-300 text-sm'>
                    Dashboard -{' '}
                    <span className='text-purple-400 font-medium'>
                      {user?.fullName || user?.email.split('@')[0]}
                    </span>
                  </span>
                </div>

                {/* User avatar for mobile */}
                <div className='lg:hidden flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full'>
                  <span className='text-white text-sm font-bold'>
                    {(user?.fullName || user?.email).charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Action buttons */}
                <Link
                  to='/'
                  className='bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-purple-500/25'
                >
                  <span className='hidden sm:inline'>Beranda</span>
                  <Icon icon='mdi:home' className='sm:hidden text-lg' />
                </Link>
                <button
                  onClick={handleSignOut}
                  className='bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-red-500/25'
                >
                  <span className='hidden sm:inline'>Keluar</span>
                  <Icon icon='mdi:logout' className='sm:hidden text-lg' />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        {/* Welcome Section */}
        <div className='bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-xl p-6 mb-6 shadow-xl'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h2 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2'>
                Dashboard Pengguna
              </h2>
              <p className='text-gray-300 text-sm sm:text-base'>
                Kelola akun yang sudah dibeli dan transaksi yang sedang berlangsung
              </p>
            </div>
            <div className='mt-4 sm:mt-0 flex items-center space-x-4'>
              <div className='bg-purple-600/20 border border-purple-500/30 rounded-lg px-4 py-2'>
                <div className='text-purple-400 text-sm font-medium'>Total Akun</div>
                <div className='text-white text-xl font-bold'>{purchasedAccounts.length}</div>
              </div>
              <div className='bg-yellow-600/20 border border-yellow-500/30 rounded-lg px-4 py-2'>
                <div className='text-yellow-400 text-sm font-medium'>Transaksi</div>
                <div className='text-white text-xl font-bold'>{ongoingTransactions.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className='bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-xl shadow-xl overflow-hidden'>
          <div className='border-b border-gray-700/50'>
            <nav className='flex overflow-x-auto'>
              <button
                onClick={() => setActiveTab('purchased')}
                className={`flex-1 min-w-0 py-4 px-6 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'purchased'
                    ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                <div className='flex items-center justify-center space-x-2'>
                  <Icon icon='mdi:account-check' className='text-lg' />
                  <span className='hidden sm:inline'>Akun Terbeli</span>
                  <span className='sm:hidden'>Terbeli</span>
                  <span className='bg-gray-700 text-white text-xs px-2 py-1 rounded-full'>
                    {purchasedAccounts.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('ongoing')}
                className={`flex-1 min-w-0 py-4 px-6 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'ongoing'
                    ? 'bg-yellow-600/20 text-yellow-400 border-b-2 border-yellow-500'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                <div className='flex items-center justify-center space-x-2'>
                  <Icon icon='mdi:clock-outline' className='text-lg' />
                  <span className='hidden sm:inline'>Transaksi Berlangsung</span>
                  <span className='sm:hidden'>Berlangsung</span>
                  <span className='bg-gray-700 text-white text-xs px-2 py-1 rounded-full'>
                    {ongoingTransactions.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 min-w-0 py-4 px-6 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'history'
                    ? 'bg-green-600/20 text-green-400 border-b-2 border-green-500'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                <div className='flex items-center justify-center space-x-2'>
                  <Icon icon='mdi:history' className='text-lg' />
                  <span className='hidden sm:inline'>Riwayat Pembayaran</span>
                  <span className='sm:hidden'>Riwayat</span>
                  <span className='bg-gray-700 text-white text-xs px-2 py-1 rounded-full'>
                    {paymentHistory.length}
                  </span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className='p-4 sm:p-6'>
            {activeTab === 'purchased' && (
              <div>
                {purchasedAccounts.length === 0 ? (
                  <div className='text-center py-12'>
                    <div className='bg-purple-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <Icon icon='mdi:shopping-outline' className='text-3xl text-purple-400' />
                    </div>
                    <h3 className='text-lg font-medium text-white mb-2'>Belum Ada Akun Terbeli</h3>
                    <p className='text-gray-400 mb-6 max-w-md mx-auto'>
                      Mulai jelajahi berbagai akun gaming berkualitas dengan harga terjangkau
                    </p>
                    <Link
                      to='/'
                      className='inline-flex items-center bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium shadow-lg hover:shadow-purple-500/25'
                    >
                      <Icon icon='mdi:compass-outline' className='mr-2' />
                      Jelajahi Akun
                    </Link>
                  </div>
                ) : (
                  <div className='grid gap-4 sm:gap-6'>
                    {purchasedAccounts.map((account, index) => (
                      <div
                        key={index}
                        className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 sm:p-6 hover:border-purple-500/50 transition-all duration-200'
                      >
                        <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between'>
                          <div className='flex-1'>
                            <div className='flex items-start space-x-3'>
                              <div className='bg-purple-600/20 p-2 rounded-lg'>
                                <Icon
                                  icon='mdi:gamepad-variant'
                                  className='text-purple-400 text-xl'
                                />
                              </div>
                              <div className='flex-1'>
                                <h4 className='text-white font-medium text-lg'>{account.title}</h4>
                                <p className='text-gray-300 text-sm mt-1'>{account.description}</p>
                                <div className='flex flex-wrap items-center gap-4 mt-3'>
                                  <div className='flex items-center text-purple-400 text-sm'>
                                    <Icon icon='mdi:calendar' className='mr-1' />
                                    {account.purchaseDate}
                                  </div>
                                  <div className='flex items-center text-green-400 text-sm'>
                                    <Icon icon='mdi:shield-check' className='mr-1' />
                                    Terverifikasi
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className='mt-4 sm:mt-0 sm:ml-4'>
                            <span className='inline-flex items-center bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30'>
                              <Icon icon='mdi:check-circle' className='mr-1' />
                              Terbeli
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ongoing' && (
              <div>
                {ongoingTransactions.length === 0 ? (
                  <div className='text-center py-12'>
                    <div className='bg-yellow-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <Icon icon='mdi:clock-outline' className='text-3xl text-yellow-400' />
                    </div>
                    <h3 className='text-lg font-medium text-white mb-2'>
                      Tidak Ada Transaksi Berlangsung
                    </h3>
                    <p className='text-gray-400 mb-6 max-w-md mx-auto'>
                      Semua transaksi Anda telah selesai. Siap untuk berbelanja lagi?
                    </p>
                    <Link
                      to='/'
                      className='inline-flex items-center bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium shadow-lg hover:shadow-purple-500/25'
                    >
                      <Icon icon='mdi:shopping' className='mr-2' />
                      Mulai Belanja
                    </Link>
                  </div>
                ) : (
                  <div className='grid gap-4 sm:gap-6'>
                    {ongoingTransactions.map((transaction, index) => (
                      <div
                        key={index}
                        onClick={() => handleTransactionClick(transaction)}
                        className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 sm:p-6 hover:border-yellow-500/50 transition-all duration-200 cursor-pointer hover:bg-gray-800/70'
                      >
                        <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between'>
                          <div className='flex-1'>
                            <div className='flex items-start space-x-3'>
                              <div className='bg-yellow-600/20 p-2 rounded-lg'>
                                <Icon
                                  icon='mdi:clock-outline'
                                  className='text-yellow-400 text-xl'
                                />
                              </div>
                              <div className='flex-1'>
                                <h4 className='text-white font-medium text-lg'>
                                  {transaction.item?.title || transaction.title || 'Gaming Account'}
                                </h4>
                                <p className='text-gray-300 text-sm mt-1'>
                                  {transaction.virtualAccountNo
                                    ? `VA: ${transaction.virtualAccountNo}`
                                    : (transaction.status === 'waiting_for_confirmation' || transaction.proofUploaded)
                                    ? 'Menunggu konfirmasi admin'
                                    : transaction.description || 'Menunggu pembayaran'}
                                </p>
                                <div className='flex items-center justify-between mt-3'>
                                  <div className='flex items-center text-yellow-400 text-sm'>
                                    <Icon icon='mdi:bank' className='mr-1' />
                                    {transaction.channel || 'Bank Transfer'}
                                  </div>
                                  <div className='text-purple-400 font-semibold'>
                                    Rp {parseInt(transaction.amount || 0).toLocaleString('id-ID')}
                                  </div>
                                </div>
                                {transaction.expiredDate && (
                                  <div className='text-xs text-gray-400 mt-2'>
                                    <Icon icon='mdi:timer-outline' className='mr-1 inline' />
                                    Berlaku hingga:{' '}
                                    {new Date(transaction.expiredDate).toLocaleString('id-ID')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className='mt-4 sm:mt-0 sm:ml-4 flex flex-col items-end space-y-2'>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                              transaction.status === 'waiting_for_confirmation' || transaction.proofUploaded
                                ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                                : 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30'
                            }`}>
                              <Icon icon='mdi:clock-outline' className='mr-1' />
                              {transaction.status === 'pending' || transaction.status === 'waiting_for_payment'
                                ? 'Menunggu Bayar'
                                : transaction.status === 'waiting_for_confirmation' || transaction.proofUploaded
                                ? 'Menunggu Konfirmasi'
                                : transaction.status}
                            </span>
                            <div className='text-xs text-gray-400 flex items-center'>
                              <Icon icon='mdi:cursor-pointer' className='mr-1' />
                              Klik untuk detail
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                {paymentHistory.length === 0 ? (
                  <div className='text-center py-12'>
                    <div className='bg-green-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <Icon icon='mdi:history' className='text-3xl text-green-400' />
                    </div>
                    <h3 className='text-lg font-medium text-white mb-2'>
                      Belum Ada Riwayat Pembayaran
                    </h3>
                    <p className='text-gray-400 mb-6 max-w-md mx-auto'>
                      Riwayat pembayaran akan muncul setelah Anda menyelesaikan transaksi
                    </p>
                    <Link
                      to='/'
                      className='inline-flex items-center bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium shadow-lg hover:shadow-purple-500/25'
                    >
                      <Icon icon='mdi:shopping' className='mr-2' />
                      Mulai Belanja
                    </Link>
                  </div>
                ) : (
                  <div className='grid gap-4 sm:gap-6'>
                    {paymentHistory.map((transaction, index) => (
                      <div
                        key={index}
                        className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 sm:p-6 hover:border-green-500/50 transition-all duration-200'
                      >
                        <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between'>
                          <div className='flex-1'>
                            <div className='flex items-start space-x-3'>
                              <div className='bg-green-600/20 p-2 rounded-lg'>
                                <Icon icon='mdi:check-circle' className='text-green-400 text-xl' />
                              </div>
                              <div className='flex-1'>
                                <h4 className='text-white font-medium text-lg'>
                                  {transaction.item?.title || transaction.title || 'Gaming Account'}
                                </h4>
                                <p className='text-gray-300 text-sm mt-1'>
                                  Trx ID: {transaction.trxId}
                                </p>
                                <div className='flex items-center justify-between mt-3'>
                                  <div className='flex items-center text-green-400 text-sm'>
                                    <Icon icon='mdi:bank' className='mr-1' />
                                    {transaction.channel || 'Bank Transfer'}
                                  </div>
                                  <div className='text-purple-400 font-semibold'>
                                    Rp {parseInt(transaction.amount || 0).toLocaleString('id-ID')}
                                  </div>
                                </div>
                                {transaction.completedAt && (
                                  <div className='text-xs text-gray-400 mt-2'>
                                    <Icon icon='mdi:calendar-check' className='mr-1 inline' />
                                    Selesai:{' '}
                                    {new Date(transaction.completedAt).toLocaleString('id-ID')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className='mt-4 sm:mt-0 sm:ml-4'>
                            <span className='inline-flex items-center bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30'>
                              <Icon icon='mdi:check-circle' className='mr-1' />
                              Berhasil
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className='mt-6 bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl'>
          <h3 className='text-lg sm:text-xl font-medium text-white mb-4 flex items-center'>
            <Icon icon='mdi:lightning-bolt' className='mr-2 text-purple-400' />
            Aksi Cepat
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            <Link
              to='/'
              className='group bg-gradient-to-r from-purple-600/20 to-purple-700/20 border border-purple-500/30 hover:border-purple-400 p-4 sm:p-6 rounded-xl text-center transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25'
            >
              <div className='bg-purple-600/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200'>
                <Icon icon='mdi:compass-outline' className='text-2xl text-purple-400' />
              </div>
              <p className='font-medium text-white mb-1'>Jelajahi Akun</p>
              <p className='text-sm text-purple-200'>Temukan akun gaming terbaik</p>
            </Link>

            <button
              onClick={() => navigate('/profile')}
              className='group bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-500/30 hover:border-blue-400 p-4 sm:p-6 rounded-xl text-center transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25'
            >
              <div className='bg-blue-600/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200'>
                <Icon icon='mdi:account-circle' className='text-2xl text-blue-400' />
              </div>
              <p className='font-medium text-white mb-1'>Profil Saya</p>
              <p className='text-sm text-blue-200'>Kelola informasi akun</p>
            </button>

            <button
              onClick={() => navigate('/support')}
              className='group bg-gradient-to-r from-green-600/20 to-green-700/20 border border-green-500/30 hover:border-green-400 p-4 sm:p-6 rounded-xl text-center transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25 sm:col-span-2 lg:col-span-1'
            >
              <div className='bg-green-600/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200'>
                <Icon icon='mdi:help-circle' className='text-2xl text-green-400' />
              </div>
              <p className='font-medium text-white mb-1'>Bantuan</p>
              <p className='text-sm text-green-200'>Hubungi customer service</p>
            </button>
          </div>
        </div>

        {/* Transaction Detail Modal */}
        {selectedTransaction && (
          <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <div className='bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl'>
              <div className='flex items-center justify-between p-6 border-b border-gray-800'>
                <h2 className='text-xl font-bold text-white'>Detail Transaksi</h2>
                <button
                  onClick={() => { setSelectedTransaction(null); setTransferProof(null); }}
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  <Icon icon='mdi:close' className='text-2xl' />
                </button>
              </div>

              <div className='p-6 space-y-6'>
                {/* Transaction Header */}
                <div className='text-center'>
                  <div className='text-2xl font-bold text-white'>{selectedTransaction.item?.title || 'Gaming Account'}</div>
                  <div className='text-purple-400 font-medium text-lg mt-1'>
                    Rp {parseInt(selectedTransaction.amount || 0).toLocaleString('id-ID')}
                  </div>
                  <div className='mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-yellow-600/20 text-yellow-400 border-yellow-500/30'>
                    Status: {selectedTransaction.status === 'pending' ? 'waiting_for_payment' : selectedTransaction.status}
                  </div>
                </div>

                {/* Bank Details */}
                {(selectedTransaction.status === 'pending' || selectedTransaction.status === 'waiting_for_payment') && (
                  <div className='bg-gray-800/50 rounded-lg p-6 border border-gray-700 space-y-4 text-center'>
                    <div className='text-gray-400 text-sm mb-2'>Silakan transfer ke rekening berikut:</div>
                    <div className='text-xl font-bold text-white mb-1'>BANK {selectedTransaction.bankDetails?.bank || 'BCA'}</div>
                    <div className='text-2xl font-mono font-bold text-purple-400 mb-1'>
                      {selectedTransaction.bankDetails?.accountNumber || '7410468225'}
                    </div>
                    <div className='text-gray-300'>a.n {selectedTransaction.bankDetails?.accountName || 'Rhandy'}</div>
                  </div>
                )}

                {/* Upload Section */}
                {(selectedTransaction.status === 'pending' || selectedTransaction.status === 'waiting_for_payment') ? (
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
                          File: {transferProof.name}
                        </div>
                      )}
                      <button
                        onClick={handleUploadProof}
                        disabled={!transferProof || isUploading}
                        className='w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        {isUploading ? 'Mengupload...' : 'Upload Bukti'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='bg-green-600/20 border border-green-500/30 rounded-lg p-4 space-y-2 relative overflow-hidden'>
                    {selectedTransaction.status === 'completed' && <div className='absolute -top-4 -right-4 w-24 h-24 bg-green-500/20 rounded-full blur-[20px]'></div>}
                    <div className='flex items-center justify-center text-green-300 relative z-10'>
                      <Icon icon='mdi:check-circle' className='text-xl mr-2' />
                      {selectedTransaction.status === 'waiting_for_confirmation'
                        ? 'Bukti transfer sudah diupload.'
                        : 'Transasksi Selesai'}
                    </div>
                    {selectedTransaction.status === 'waiting_for_confirmation' && (
                       <div className='text-center text-sm text-green-200 relative z-10'>
                       Menunggu admin memverifikasi pembayaran Anda (biasanya 1-2 jam).
                       </div>
                    )}

                    {/* Render LZT Account Credentials if available */}
                    {selectedTransaction.status === 'completed' && selectedTransaction.loginData && (
                        <div className='mt-4 p-4 bg-gray-900 border border-gray-700 rounded-xl relative z-10 flex flex-col'>
                            <h4 className='text-sm font-bold text-gray-400 tracking-wider uppercase mb-3 text-center border-b border-gray-800 pb-2'>Kredensial Akun</h4>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className='space-y-1'>
                                    <span className='text-xs text-gray-500 uppercase tracking-widest'>Username / Login</span>
                                    <div className='bg-black p-3 rounded-lg border border-gray-800 text-gray-200 font-mono text-sm break-all select-all flex items-center justify-between group'>
                                      {selectedTransaction.loginData.login}
                                      <Icon icon='mdi:content-copy' className='text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer mx-1' onClick={() => navigator.clipboard.writeText(selectedTransaction.loginData.login)} />
                                    </div>
                                </div>

                                <div className='space-y-1'>
                                    <span className='text-xs text-gray-500 uppercase tracking-widest'>Password</span>
                                    <div className='bg-black p-3 rounded-lg border border-gray-800 text-gray-200 font-mono text-sm break-all select-all flex items-center justify-between group'>
                                      {selectedTransaction.loginData.password}
                                      <Icon icon='mdi:content-copy' className='text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer mx-1' onClick={() => navigator.clipboard.writeText(selectedTransaction.loginData.password)} />
                                    </div>
                                </div>
                            </div>

                            {selectedTransaction.loginData.emailLoginUrl && (
                                <div className='mt-4 pt-4 border-t border-gray-800 text-center'>
                                   <a
                                      href={selectedTransaction.loginData.emailLoginUrl}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors'
                                    >
                                        <Icon icon='mdi:email-outline' className='mr-1' /> Buka Webmail Email Akun
                                   </a>
                                </div>
                            )}
                        </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default Dashboard
