import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { Icon } from '@iconify/react'
import PaymentDetailModal from './PaymentDetailModal'

const Dashboard = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('purchased')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [paymentDetailModal, setPaymentDetailModal] = useState(false)

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
    setSelectedTransaction(transaction)
    setPaymentDetailModal(true)
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
                            <span className='inline-flex items-center bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium border border-yellow-500/30'>
                              <Icon icon='mdi:clock-outline' className='mr-1' />
                              {transaction.status === 'pending'
                                ? 'Menunggu Bayar'
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
      </main>

      {/* Payment Detail Modal */}
      <PaymentDetailModal
        isOpen={paymentDetailModal}
        onClose={() => {
          setPaymentDetailModal(false)
          setSelectedTransaction(null)
        }}
        transaction={selectedTransaction}
        onTransactionUpdate={handleTransactionUpdate}
      />
    </div>
  )
}

export default Dashboard
