import { Icon } from '@iconify/react'
import { arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'
import { useMemo, useState } from 'react'
import { db } from '../config/firebase'

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [checkResult, setCheckResult] = useState(null)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [previewData, setPreviewData] = useState(null)

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const ADMIN_PASSWORD = 'admin123'

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      loadOrders()
    } else {
      alert('Password salah!')
    }
  }

  const loadOrders = async () => {
    setLoading(true)
    try {
      const ordersRef = collection(db, 'orders')
      const snapshot = await getDocs(ordersRef)
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setOrders(ordersData.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()))
    } catch (error) {
      console.error('Error loading orders:', error)
      alert('Gagal memuat data pesanan')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId)
      if (!order) return

      const orderRef = doc(db, 'orders', orderId)
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date()
      })

      // If confirming, sync with User's data
      if (order.customerUid) {
        try {
          const userRef = doc(db, 'users', order.customerUid)
          const userSnap = await getDoc(userRef)

          if (userSnap.exists()) {
            const userData = userSnap.data()
            const ongoing = userData.ongoingTransactions || []

            // Find the transaction being updated
            const trxIndex = ongoing.findIndex(t => t.orderId === orderId || t.trxId === orderId)

            if (trxIndex !== -1) {
              const transaction = ongoing[trxIndex]

              if (newStatus === 'confirmed' || newStatus === 'completed') {
                // Move to history and purchased
                const updatedOngoing = ongoing.filter((_, idx) => idx !== trxIndex)

                const historyEntry = {
                  ...transaction,
                  status: 'completed',
                  completedAt: new Date().toISOString()
                }

                // Make purchased account entry
                const purchasedEntry = {
                  ...transaction.item,
                  purchaseDate: new Date().toLocaleString('id-ID'),
                  trxId: transaction.trxId || orderId
                }

                await updateDoc(userRef, {
                  ongoingTransactions: updatedOngoing,
                  paymentHistory: arrayUnion(historyEntry),
                  purchasedAccounts: arrayUnion(purchasedEntry)
                })
              } else if (newStatus === 'rejected') {
                 // Keep in ongoing but set status to rejected (or move to history as failed)
                 const updatedOngoing = [...ongoing]
                 updatedOngoing[trxIndex] = { ...transaction, status: 'rejected' }
                 await updateDoc(userRef, {
                    ongoingTransactions: updatedOngoing
                 })
              }
            }
          }
        } catch (err) {
          console.error('Failed to sync user data:', err)
        }
      }

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date() }
          : order
      ))

      alert(`Status pesanan berhasil diubah menjadi ${newStatus}`)
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Gagal mengubah status pesanan')
    }
  }

  const handlePurchaseAccount = async (orderId) => {
    try {
      setIsPurchasing(true)
      const order = orders.find(o => o.id === orderId)
      if (!order || !order.items || order.items.length === 0) {
        alert('Order corrupt: No items found to purchase.')
        return
      }

      // Handle the first item in the order (assuming 1 LZT account per order)
      const itemToBuy = order.items[0]
      const lztItemId = itemToBuy.item_id || itemToBuy.id

      if (!lztItemId) {
          alert('Item ID missing from cart payload.')
          return
      }

      // Call our Vercel fastbuy proxy
      const response = await fetch('/api/unify?name=lzt-fastbuy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item_id: lztItemId })
      })

      const result = await response.json()

      if (!response.ok || result.status !== 'ok') {
          console.error('Fast-Buy failed:', result)
          alert(`Gagal membeli akun dari API: ${result.errors ? result.errors.join(', ') : (result.error_description || 'Unknown API Error')}`)
          return
      }

      const loginData = result.item?.loginData

      if (!loginData) {
          alert('API responded success but loginData was missing from payload.')
          return
      }

      // Update Order document in Firebase with credentials
      const orderRef = doc(db, 'orders', orderId)
      await updateDoc(orderRef, {
        status: 'completed',
        loginData: loginData,
        purchasedAt: new Date(),
        updatedAt: new Date()
      })

      // Sync User database
      if (order.customerUid) {
        const userRef = doc(db, 'users', order.customerUid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          const userData = userSnap.data()
          const ongoing = userData.ongoingTransactions || []
          const trxIndex = ongoing.findIndex(t => t.orderId === orderId || t.trxId === orderId)

          if (trxIndex !== -1) {
            const transaction = ongoing[trxIndex]
            const updatedOngoing = ongoing.filter((_, idx) => idx !== trxIndex)

            const historyEntry = {
              ...transaction,
              status: 'completed',
              completedAt: new Date().toISOString()
            }

            // Bind the credentials into the purchased object so Dashboard can read it
            const purchasedEntry = {
              ...transaction.item,
              purchaseDate: new Date().toLocaleString('id-ID'),
              trxId: transaction.trxId || orderId,
              loginData: loginData
            }

            await updateDoc(userRef, {
              ongoingTransactions: updatedOngoing,
              paymentHistory: arrayUnion(historyEntry),
              purchasedAccounts: arrayUnion(purchasedEntry)
            })
          }
        }
      }

      // Update local UI state
      setOrders(orders.map(o =>
        o.id === orderId
          ? { ...o, status: 'completed', loginData: loginData, updatedAt: new Date() }
          : o
      ))

      setSelectedOrder(prev => ({ ...prev, status: 'completed', loginData: loginData }))

      alert('Berhasil membeli akun! Kredensial telah diteruskan ke pengguna.')

    } catch (error) {
       console.error('Fatal Fast-buy process error:', error)
       alert('Terjadi kesalahan sistem saat mencoba membeli akun.')
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleCheckAccount = async (orderId) => {
    try {
      setIsChecking(true)
      setCheckResult(null)
      const order = orders.find(o => o.id === orderId)
      if (!order || !order.items || order.items.length === 0) {
        alert('Order corrupt: No items found to check.')
        return
      }

      const itemToBuy = order.items[0]
      const lztItemId = itemToBuy.item_id || itemToBuy.id

      if (!lztItemId) {
          alert('Item ID missing from cart payload.')
          return
      }

      const response = await fetch('/api/unify?name=lzt-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item_id: lztItemId })
      })

      const result = await response.json()
      setCheckResult(result)

    } catch (error) {
       console.error('Fatal API Check error:', error)
       alert('Terjadi kesalahan jaringan saat mengecek status akun ke LZT.')
    } finally {
      setIsChecking(false)
    }
  }

  const handlePreviewAccount = async (orderId) => {
    try {
      setIsPreviewing(true)
      setPreviewData(null)
      const order = orders.find(o => o.id === orderId)
      if (!order || !order.items || order.items.length === 0) {
        alert('Order corrupt: No items found to preview.')
        return
      }

      const itemToBuy = order.items[0]
      const lztItemId = itemToBuy.item_id || itemToBuy.id

      if (!lztItemId) {
          alert('Item ID missing from cart payload.')
          return
      }

      const response = await fetch('/api/unify?name=lzt-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item_id: lztItemId })
      })

      const result = await response.json()
      setPreviewData(result)

    } catch (error) {
       console.error('Fatal API Preview error:', error)
       alert('Terjadi kesalahan jaringan saat mengambil data akun.')
    } finally {
      setIsPreviewing(false)
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Yakin ingin menghapus pesanan ini? Aksi ini tidak dapat dibatalkan.')) return

    try {
      await deleteDoc(doc(db, 'orders', orderId))
      setOrders(orders.filter(order => order.id !== orderId))
      alert('Pesanan berhasil dihapus')
    } catch (error) {
       console.error('Error deleting order:', error)
       alert('Gagal menghapus pesanan')
    }
  }

  const formatCurrency = (amount) => {
    try {
      const parsedAmount = Number(amount)
      if (isNaN(parsedAmount)) return 'Rp 0'
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(parsedAmount)
    } catch (e) {
      return 'Rp 0'
    }
  }

  const formatDate = (date) => {
    if (!date) return '-'
    try {
      const d = date.toDate ? date.toDate() : new Date(date)
      return d.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return '-'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting_for_payment':
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
      case 'waiting_for_confirmation':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
      case 'confirmed':
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
      case 'rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'waiting_for_payment':
      case 'pending':
        return 'Menunggu Pembayaran'
      case 'waiting_for_confirmation':
        return 'Menunggu Konfirmasi'
      case 'confirmed':
      case 'completed':
        return 'Selesai'
      case 'rejected':
        return 'Ditolak'
      default:
        return status
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'waiting_for_payment':
      case 'pending':
        return 'mdi:clock-outline'
      case 'waiting_for_confirmation':
        return 'mdi:magnify'
      case 'confirmed':
      case 'completed':
        return 'mdi:check-circle-outline'
      case 'rejected':
        return 'mdi:close-circle-outline'
      default:
        return 'mdi:help-circle-outline'
    }
  }

  // Analytics Calculations
  const analytics = useMemo(() => {
    const totalOrders = orders.length
    const pendingConfirmation = orders.filter(o => o.status === 'waiting_for_confirmation').length
    const completedOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'completed').length
    const totalRevenue = orders
      .filter(o => o.status === 'confirmed' || o.status === 'completed')
      .reduce((sum, order) => sum + (Number(order.amount) || 0), 0)

    const successRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0

    return { totalOrders, pendingConfirmation, completedOrders, totalRevenue, successRate }
  }, [orders])

  // Filtering Logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customerEmail && order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'pending' && (order.status === 'pending' || order.status === 'waiting_for_payment')) ||
        (statusFilter === 'confirmation' && order.status === 'waiting_for_confirmation') ||
        (statusFilter === 'completed' && (order.status === 'confirmed' || order.status === 'completed')) ||
        (statusFilter === 'rejected' && order.status === 'rejected')

      let matchesDate = true
      if (dateFilter && order.createdAt) {
        const d = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
        const orderMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        matchesDate = orderMonth === dateFilter
      }

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [orders, searchTerm, statusFilter, dateFilter])

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen bg-[#0a0f1c] flex items-center justify-center p-4 relative overflow-hidden'>
        {/* Background Gradients */}
        <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none' />
        <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none' />

        <div className='bg-[#111827]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full max-w-md relative z-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]'>
          <div className='text-center mb-8'>
            <div className='w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-white/5 shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]'>
                <Icon icon='mdi:shield-lock-outline' className='text-5xl text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]' />
            </div>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2'>SYSTEM ADMIN</h1>
            <p className='text-gray-400 font-medium tracking-wide text-sm'>Akses Terbatas: SenjaGames Terminal</p>
          </div>

          <form onSubmit={handleLogin} className='space-y-6'>
            <div className='space-y-2'>
              <label className='text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1'>Authorization Key</label>
              <div className='relative'>
                <Icon icon='mdi:key-outline' className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl' />
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                  className='w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono tracking-widest'
                  required
                />
              </div>
            </div>

            <button
              type='submit'
              className='w-full relative group bg-gradient-to-r from-purple-600 to-blue-600 p-[1px] rounded-xl overflow-hidden'
            >
              <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-70 group-hover:opacity-100 blur transition-opacity duration-300' />
              <div className='relative bg-[#111827] px-6 py-4 rounded-xl flex items-center justify-center space-x-2 transition-colors group-hover:bg-opacity-0'>
                <span className='font-bold text-white tracking-widest'>DECRYPT & ENTER</span>
                <Icon icon='mdi:arrow-right' className='text-white group-hover:translate-x-1 transition-transform' />
              </div>
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#060913] p-4 sm:p-6 md:p-8 font-sans relative text-gray-200'>
      {/* Abstract Background Noise / Gradients */}
      <div className='fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0'>
        <div className='absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-900/10 blur-[150px] rounded-full mix-blend-screen' />
        <div className='absolute bottom-[10%] -left-[10%] w-[60%] h-[40%] bg-blue-900/10 blur-[150px] rounded-full mix-blend-screen' />
      </div>

      <div className='max-w-[1600px] mx-auto relative z-10 space-y-8'>
        {/* Navigation & Header */}
        <header className='flex flex-col md:flex-row md:items-end justify-between bg-white/[0.02] border border-white/5 backdrop-blur-xl p-6 rounded-3xl shadow-2xl'>
          <div className='flex items-center'>
            <h1 className='text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 tracking-tight'>
              senjagames.id
            </h1>
          </div>

          <button
            onClick={() => setIsAuthenticated(false)}
            className='mt-6 md:mt-0 flex items-center space-x-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all duration-300 font-bold tracking-wide'
          >
            <Icon icon='mdi:logout' className='text-xl' />
            <span>Logout</span>
          </button>
        </header>

        {/* Analytics Top Row */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {/* Card 1: Revenue */}
          <div className='bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col justify-between group hover:border-emerald-500/30 transition-colors'>
            <div className='flex items-start justify-between mb-4'>
              <div className='w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform'>
                <Icon icon='mdi:currency-usd' className='text-2xl text-emerald-400' />
              </div>
              <span className='px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20'>+14% (30d)</span>
            </div>
            <div>
              <h3 className='text-gray-400 font-medium mb-1'>Gross Verified Revenue</h3>
              <div className='text-3xl font-bold text-white tracking-tight flex items-baseline'>
                <span className='text-emerald-400 text-lg mr-1'>Rp</span>
                {new Intl.NumberFormat('id-ID').format(analytics.totalRevenue)}
              </div>
            </div>
          </div>

          {/* Card 2: Needs Confirmation */}
          <div className='bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col justify-between group hover:border-blue-500/30 transition-colors relative overflow-hidden'>
            {analytics.pendingConfirmation > 0 && (
                <div className='absolute -top-1 -right-1 w-20 h-20 bg-blue-500/20 blur-[30px] rounded-full animate-pulse' />
            )}
            <div className='flex items-start justify-between mb-4'>
              <div className='w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform'>
                <Icon icon='mdi:script-text-outline' className='text-2xl text-blue-400' />
              </div>
            </div>
            <div>
              <h3 className='text-gray-400 font-medium mb-1'>Needs Verification</h3>
              <div className='text-4xl font-bold text-white tracking-tight flex items-center'>
                {analytics.pendingConfirmation}
                <span className='text-sm font-normal text-gray-500 ml-3 uppercase tracking-widest'>Orders</span>
              </div>
            </div>
          </div>

          {/* Card 3: Success Rate */}
          <div className='bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col justify-between group hover:border-purple-500/30 transition-colors'>
            <div className='flex items-start justify-between mb-4'>
              <div className='w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform'>
                <Icon icon='mdi:chart-donut' className='text-2xl text-purple-400' />
              </div>
              <div className='w-12 bg-gray-800 rounded-full h-1.5 mt-2 overflow-hidden'>
                 <div className='bg-purple-500 h-1.5' style={{ width: `${analytics.successRate}%` }}></div>
              </div>
            </div>
            <div>
              <h3 className='text-gray-400 font-medium mb-1'>Conversion Rate</h3>
              <div className='text-4xl font-bold text-white tracking-tight flex items-baseline'>
                 {analytics.successRate}<span className='text-purple-400 text-2xl ml-1'>%</span>
              </div>
            </div>
          </div>

          {/* Card 4: Total Processed */}
          <div className='bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col justify-between group hover:border-pink-500/30 transition-colors'>
            <div className='flex items-start justify-between mb-4'>
              <div className='w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center border border-pink-500/20 group-hover:scale-110 transition-transform'>
                <Icon icon='mdi:cube-send' className='text-2xl text-pink-400' />
              </div>
            </div>
            <div>
              <h3 className='text-gray-400 font-medium mb-1'>Total Inflow Tracks</h3>
              <div className='text-4xl font-bold text-white tracking-tight flex items-center'>
                {analytics.totalOrders}
                <span className='text-sm font-normal text-gray-500 ml-3 uppercase tracking-widest'>Logs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar (Filters & Search) */}
        <div className='flex flex-col md:flex-row md:flex-wrap lg:flex-nowrap gap-4 justify-between bg-white/[0.02] border border-white/5 backdrop-blur-xl p-4 rounded-2xl'>
            <div className='flex flex-col sm:flex-row gap-4 w-full lg:w-auto'>
              {/* Text Search */}
              <div className='relative w-full sm:w-64 md:w-80 lg:w-96 shrink-0'>
                  <Icon icon='mdi:magnify' className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl' />
                  <input
                    type='text'
                    placeholder='Search by ID, User, or Email...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='w-full bg-black/40 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono text-sm'
                  />
              </div>

              {/* Date Filter */}
              <div className='relative shrink-0'>
                  <Icon icon='mdi:calendar-month' className='absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 text-xl pointer-events-none' />
                  <input
                    type='month'
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className='h-full bg-black/40 border border-white/5 hover:border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono text-sm cursor-pointer'
                  />
                  {dateFilter && (
                    <button
                      onClick={() => setDateFilter('')}
                      className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1'
                      title='Clear Date Filter'
                    >
                      <Icon icon='mdi:close' />
                    </button>
                  )}
              </div>
            </div>

            {/* Status Tabs */}
            <div className='flex items-center space-x-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-scrollbar shrink-0'>
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${statusFilter === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  All Logs
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-colors flex items-center ${statusFilter === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <span className='w-2 h-2 rounded-full bg-yellow-400 mr-2'></span> Unpaid
                </button>
                <button
                  onClick={() => setStatusFilter('confirmation')}
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-colors flex items-center ${statusFilter === 'confirmation' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <span className='w-2 h-2 rounded-full bg-blue-400 mr-2'></span> Requires Review
                  {analytics.pendingConfirmation > 0 && <span className='ml-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full'>{analytics.pendingConfirmation}</span>}
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-colors flex items-center ${statusFilter === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <span className='w-2 h-2 rounded-full bg-emerald-400 mr-2'></span> Success
                </button>
            </div>
        </div>

        {/* Data Grid / Table */}
        <div className='bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl relative'>

          {loading && (
             <div className='absolute inset-0 z-20 bg-[#060913]/80 backdrop-blur-sm flex items-center justify-center'>
                <div className='flex flex-col items-center space-y-4'>
                    <div className='w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin'></div>
                    <span className='text-purple-400 font-mono tracking-widest text-sm animate-pulse'>FETCHING_DATABANKS...</span>
                </div>
             </div>
          )}

          <div className='overflow-x-auto'>
            {filteredOrders.length === 0 && !loading ? (
                <div className='p-16 text-center flex flex-col items-center justify-center'>
                    <Icon icon='mdi:database-remove-outline' className='text-7xl text-gray-700 mb-4' />
                    <h3 className='text-xl font-medium text-gray-300'>No Records Located</h3>
                    <p className='text-gray-500 mt-2 max-w-sm'>Adjust your filters or scanning parameters to locate transaction data.</p>
                </div>
            ) : (
                <table className='w-full text-left border-collapse'>
                <thead>
                    <tr className='border-b border-white/5 bg-black/20'>
                    <th className='py-5 px-6 font-semibold text-gray-400 text-xs tracking-widest uppercase'>Transact ID</th>
                    <th className='py-5 px-6 font-semibold text-gray-400 text-xs tracking-widest uppercase'>Client Node</th>
                    <th className='py-5 px-6 font-semibold text-gray-400 text-xs tracking-widest uppercase'>Fiscal Sum</th>
                    <th className='py-5 px-6 font-semibold text-gray-400 text-xs tracking-widest uppercase text-center'>State</th>
                    <th className='py-5 px-6 font-semibold text-gray-400 text-xs tracking-widest uppercase text-center'>Timestamp</th>
                    <th className='py-5 px-6 font-semibold text-gray-400 text-xs tracking-widest uppercase text-right'>Directive</th>
                    </tr>
                </thead>
                <tbody className='divide-y divide-white/5'>
                    {filteredOrders.map((order) => (
                    <tr key={order.id} className='hover:bg-white/[0.02] transition-colors group cursor-pointer' onClick={() => setSelectedOrder(order)}>
                        <td className='py-4 px-6 relative'>
                            {order.status === 'waiting_for_confirmation' && (
                                <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]' />
                            )}
                            <div className='flex items-center'>
                                <Icon icon='mdi:barcode-scan' className='text-gray-600 mr-2 text-lg group-hover:text-purple-400 transition-colors' />
                                <span className='font-mono text-sm text-gray-300'>{order.id}</span>
                            </div>
                        </td>
                        <td className='py-4 px-6'>
                            <div className='flex items-center space-x-3'>
                                <div className='w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-white/10 text-xs font-bold'>
                                    {(order.customerName || '?').charAt(0).toUpperCase()}
                                </div>
                                <div className='flex flex-col'>
                                    <span className='font-medium text-gray-200'>{order.customerName || 'Unknown Entity'}</span>
                                    <span className='text-xs text-gray-500 font-mono'>{order.customerEmail || 'No comm interface'}</span>
                                </div>
                            </div>
                        </td>
                        <td className='py-4 px-6'>
                            <span className='font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400'>
                                {formatCurrency(order.amount)}
                            </span>
                        </td>
                        <td className='py-4 px-6 text-center'>
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase border ${getStatusColor(order.status)}`}>
                                <Icon icon={getStatusIcon(order.status)} className='mr-1.5 text-sm' />
                                {getStatusText(order.status)}
                            </span>
                        </td>
                        <td className='py-4 px-6 text-center'>
                            <span className='font-mono text-xs text-gray-400 block'>{formatDate(order.createdAt).split(',')[0]}</span>
                            <span className='font-mono text-[10px] text-gray-600'>{formatDate(order.createdAt).split(',')[1]}</span>
                        </td>
                        <td className='py-4 px-6 text-right'>
                            <button
                              className='w-8 h-8 rounded-full bg-white/5 hover:bg-purple-500/20 hover:text-purple-400 border border-transparent hover:border-purple-500/30 flex items-center justify-center transition-all ml-auto'
                              onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                            >
                                <Icon icon='mdi:chevron-right' className='text-xl' />
                            </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Detail Modal */}
      {selectedOrder && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6'>
            {/* Modal Backdrop Array */}
            <div className='absolute inset-0 bg-black/60 backdrop-blur-md' onClick={() => setSelectedOrder(null)} />

            <div className='relative w-full max-w-5xl bg-[#0a0f1c] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col md:flex-row overflow-hidden max-h-[90vh]'>

                {/* Left Panel: Transaction Metadata Container */}
                <div className='flex-1 border-r border-white/5 flex flex-col overflow-y-auto custom-scrollbar relative'>
                    {/* Header */}
                    <div className='sticky top-0 bg-[#0a0f1c]/90 backdrop-blur-xl border-b border-white/5 p-6 md:p-8 z-10 flex justify-between items-start'>
                        <div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border mb-4 ${getStatusColor(selectedOrder.status)}`}>
                                <Icon icon={getStatusIcon(selectedOrder.status)} className='mr-1.5' />
                                {getStatusText(selectedOrder.status)}
                            </span>
                            <h2 className='text-3xl font-black text-white tracking-tight'>TX RECORD</h2>
                            <p className='text-gray-400 font-mono text-sm flex items-center mt-1'>
                                <Icon icon='mdi:link-variant' className='mr-1 text-purple-400' />
                                {selectedOrder.id}
                            </p>
                        </div>
                        <button onClick={() => setSelectedOrder(null)} className='w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/10'>
                            <Icon icon='mdi:close' className='text-xl text-gray-300' />
                        </button>
                    </div>

                    {/* Metadata Content Body */}
                    <div className='p-6 md:p-8 space-y-8'>

                        {/* Cost & Items block */}
                        <div>
                            <h3 className='text-xs font-bold text-gray-500 tracking-widest uppercase mb-4'>Financial Ledger</h3>
                            <div className='bg-black/30 border border-white/5 rounded-2xl p-6 relative overflow-hidden'>
                                {/* Abstract glow */}
                                <div className='absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 blur-[20px] rounded-full' />

                                <div className='flex justify-between items-end mb-6 pb-6 border-b border-white/10'>
                                    <span className='text-gray-400 font-medium'>Total Transacted</span>
                                    <span className='text-3xl font-black text-emerald-400'>{formatCurrency(selectedOrder.amount)}</span>
                                </div>

                                <div className='space-y-4'>
                                    {(selectedOrder.items || []).length > 0 ? selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className='flex items-start justify-between'>
                                            <div className='flex-1 pr-4'>
                                                <div className='text-gray-200 font-medium mb-1 line-clamp-2'>{item.title || 'Unknown Item Asset'}</div>
                                                <div className='text-xs text-gray-500 font-mono'>Item Ref: {item.id || 'N/A'}</div>
                                            </div>
                                            <div className='text-right'>
                                                <div className='text-gray-300 font-mono'>x{item.quantity || 1}</div>
                                                <div className='text-xs text-purple-400 mt-1'>{formatCurrency((Number(item.priceIDR) || 0) * (Number(item.quantity) || 1))}</div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className='text-sm text-gray-500 font-mono italic'>No line-item data attached to this legacy record.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Customer & Bank Info grid */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <div className='bg-black/30 border border-white/5 rounded-2xl p-5'>
                                <Icon icon='mdi:account-box-outline' className='text-2xl text-purple-400 mb-3' />
                                <h3 className='text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1'>Client Identity</h3>
                                <div className='text-gray-200 font-medium'>{selectedOrder.customerName || 'Unknown'}</div>
                                <div className='text-gray-500 text-xs mt-1 truncate'>{selectedOrder.customerEmail}</div>
                                <div className='text-gray-600 text-[10px] mt-2 font-mono truncate'>UID: {selectedOrder.customerUid || 'none'}</div>
                            </div>

                            <div className='bg-black/30 border border-white/5 rounded-2xl p-5'>
                                <Icon icon='mdi:bank-transfer' className='text-2xl text-blue-400 mb-3' />
                                <h3 className='text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1'>Routing Detail</h3>
                                <div className='text-gray-200 font-bold'>BANK {selectedOrder.bankDetails?.bank || 'BCA'}</div>
                                <div className='text-blue-400 font-mono text-sm my-1'>{selectedOrder.bankDetails?.accountNumber || 'Unknown Routing'}</div>
                                <div className='text-gray-500 text-xs'>a.n {selectedOrder.bankDetails?.accountName || '-'}</div>
                            </div>
                        </div>

                        {/* Time Metadata */}
                        <div className='flex items-center text-xs text-gray-500 space-x-4 border-t border-white/5 pt-6'>
                            <span className='flex items-center'><Icon icon='mdi:calendar-arrow-right' className='mr-1.5 text-lg' /> Created: {formatDate(selectedOrder.createdAt)}</span>
                            <span className='flex items-center'><Icon icon='mdi:calendar-edit' className='mr-1.5 text-lg' /> Updated: {formatDate(selectedOrder.updatedAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Artifact & Directives */}
                <div className='w-full md:w-[400px] lg:w-[450px] bg-[#111827] flex flex-col relative'>

                    {/* Visual Asset Block */}
                    <div className='flex-1 p-6 md:p-8 flex flex-col relative overflow-y-auto'>
                        <h3 className='text-xs font-bold text-gray-500 tracking-widest uppercase mb-4 flex items-center'>
                            <Icon icon='mdi:file-image-outline' className='mr-2 text-lg' />
                            Verified Artifact (Proof)
                        </h3>

                        {(selectedOrder.transferProofUrl || selectedOrder.transferProofDataUrl) ? (
                            <div className='flex-1 flex items-center justify-center'>
                                <div className='w-full relative group'>
                                    {/* Glowing Frame */}
                                    <div className='absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500'></div>
                                    <img
                                        src={selectedOrder.transferProofDataUrl || selectedOrder.transferProofUrl}
                                        alt='Decrypted Evidence'
                                        className='relative w-full rounded-2xl border border-white/10 shadow-2xl object-cover max-h-[50vh] min-h-[200px] cursor-crosshair'
                                        title='Payment Artifact'
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className='flex-1 flex items-center justify-center'>
                                <div className='w-full aspect-square max-h-[300px] rounded-2xl border-2 border-dashed border-gray-700/50 flex flex-col items-center justify-center p-6 text-center bg-black/20'>
                                    <Icon icon='mdi:image-off-outline' className='text-5xl text-gray-600 mb-4' />
                                    <p className='text-gray-400 font-medium'>No Artifact Attached</p>
                                    <p className='text-gray-600 text-xs mt-2'>The client node has not transmitted visual payment confirmation.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Operational Directives (Actions) */}
                    <div className='p-6 md:p-8 bg-black/40 border-t border-white/5 backdrop-blur-3xl shrink-0'>
                        {selectedOrder.status === 'waiting_for_confirmation' ? (
                            <div className='space-y-4'>
                                <p className='text-xs text-blue-400/80 font-mono text-center mb-4 uppercase tracking-widest'>Required Action Pending</p>
                                <button
                                    onClick={() => {
                                        updateOrderStatus(selectedOrder.id, 'confirmed')
                                        setSelectedOrder(null)
                                    }}
                                    className='w-full relative group bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white py-4 rounded-xl font-bold tracking-wide transition-all overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                                >
                                    <Icon icon='mdi:check-all' className='mr-2 text-xl' />
                                    APPROVE TRANSACTION
                                </button>

                                <div className='flex space-x-4'>
                                    <button
                                        onClick={() => {
                                            updateOrderStatus(selectedOrder.id, 'rejected')
                                            setSelectedOrder(null)
                                        }}
                                        className='flex-1 flex items-center justify-center py-3 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 rounded-xl font-bold text-sm transition-all'
                                    >
                                        <Icon icon='mdi:close-octagon' className='mr-2' /> DENY
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleDeleteOrder(selectedOrder.id)
                                            setSelectedOrder(null)
                                        }}
                                        className='w-12 flex items-center justify-center bg-gray-800 hover:bg-red-900 border border-gray-700 hover:border-red-500 rounded-xl text-gray-400 hover:text-white transition-all'
                                        title='Delete Record Completely'
                                    >
                                        <Icon icon='mdi:delete-alert-outline' />
                                    </button>
                                </div>
                            </div>
                        ) : selectedOrder.status === 'confirmed' ? (
                            <div className='space-y-3 overflow-y-auto max-h-[70vh] custom-scrollbar'>
                                <p className='text-xs text-purple-400/80 font-mono text-center mb-3 uppercase tracking-widest'>Payment Validated</p>

                                {/* Action Buttons Grid */}
                                <div className='grid grid-cols-2 gap-3'>
                                    <button
                                        onClick={() => handlePreviewAccount(selectedOrder.id)}
                                        disabled={isPreviewing || isPurchasing}
                                        className={`flex items-center justify-center py-3 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-600 hover:text-white border border-cyan-500/30 rounded-xl font-bold text-sm transition-all ${(isPreviewing || isPurchasing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isPreviewing ? (
                                            <><Icon icon='mdi:loading' className='animate-spin mr-2' /> LOADING...</>
                                        ) : (
                                            <><Icon icon='mdi:eye-outline' className='mr-2 text-lg' /> PREVIEW</>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleCheckAccount(selectedOrder.id)}
                                        disabled={isChecking || isPurchasing}
                                        className={`flex items-center justify-center py-3 bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 rounded-xl font-bold text-sm transition-all ${(isChecking || isPurchasing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isChecking ? (
                                            <><Icon icon='mdi:loading' className='animate-spin mr-2' /> CHECKING...</>
                                        ) : (
                                            <><Icon icon='mdi:shield-check' className='mr-2 text-lg' /> CHECK</>
                                        )}
                                    </button>
                                </div>

                                <button
                                    onClick={() => handlePurchaseAccount(selectedOrder.id)}
                                    disabled={isPurchasing || isChecking || isPreviewing}
                                    className={`w-full relative group bg-purple-500/20 text-purple-400 border border-purple-500/40 hover:bg-purple-600 hover:text-white py-5 rounded-xl font-bold tracking-wider transition-all overflow-hidden flex flex-col items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] ${(isPurchasing || isChecking || isPreviewing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isPurchasing ? (
                                        <div className='flex items-center space-x-2'>
                                            <Icon icon='mdi:loading' className='animate-spin text-2xl' />
                                            <span>MEMBELI AKUN...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className='flex items-center text-lg mb-1'>
                                                <Icon icon='mdi:cart-arrow-down' className='mr-2 text-2xl' />
                                                BELI AKUN (FAST-BUY)
                                            </div>
                                            <span className='text-[10px] font-mono opacity-75 font-normal tracking-wide'>Menghubungi API LZT Market...</span>
                                        </>
                                    )}
                                </button>

                                {/* Preview Card */}
                                {previewData && previewData.item && (
                                    <div className='mt-2 p-4 rounded-xl border bg-cyan-900/10 border-cyan-500/20'>
                                        <div className='flex items-center justify-between mb-3'>
                                            <h4 className='text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center'>
                                                <Icon icon='mdi:eye' className='mr-1.5' /> Account Preview
                                            </h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${previewData.item.item_state === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                {previewData.item.item_state?.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className='space-y-2 text-sm'>
                                            <div className='flex justify-between'>
                                                <span className='text-gray-500'>Title</span>
                                                <span className='text-white font-medium text-right max-w-[60%] truncate'>{previewData.item.title_en || previewData.item.title}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-gray-500'>Category</span>
                                                <span className='text-white'>{previewData.item.category?.category_title || 'N/A'}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-gray-500'>Price (USD)</span>
                                                <span className='text-emerald-400 font-bold'>${previewData.item.price}</span>
                                            </div>
                                            {previewData.item.guarantee && (
                                                <div className='flex justify-between'>
                                                    <span className='text-gray-500'>Guarantee</span>
                                                    <span className='text-blue-400'>{previewData.item.guarantee.durationPhrase}</span>
                                                </div>
                                            )}
                                            <div className='flex justify-between'>
                                                <span className='text-gray-500'>Origin</span>
                                                <span className='text-gray-300'>{previewData.item.itemOriginPhrase || previewData.item.item_origin}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-gray-500'>Seller</span>
                                                <span className='text-purple-400'>{previewData.item.seller?.username || 'N/A'}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-gray-500'>Seller Items Sold</span>
                                                <span className='text-gray-300'>{previewData.item.seller?.sold_items_count?.toLocaleString() || '0'}</span>
                                            </div>
                                            {previewData.item.steam_full_games && (
                                                <div className='pt-2 border-t border-white/5'>
                                                    <span className='text-gray-500 text-xs'>Games ({previewData.item.steam_full_games.total})</span>
                                                    <div className='flex flex-wrap gap-1 mt-1'>
                                                        {Object.values(previewData.item.steam_full_games.list || {}).map((game, i) => (
                                                            <span key={i} className='text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-gray-300'>{game.abbr || game.title}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {previewData.canBuyItem !== undefined && (
                                                <div className='flex justify-between pt-2 border-t border-white/5'>
                                                    <span className='text-gray-500'>Can Buy</span>
                                                    <span className={previewData.canBuyItem ? 'text-emerald-400' : 'text-red-400'}>{previewData.canBuyItem ? 'Yes' : 'No'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Check Result */}
                                {checkResult && (
                                    <div className={`mt-2 p-4 rounded-xl border ${!checkResult.errors ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-red-900/10 border-red-500/20'}`}>
                                        <div className='flex items-center mb-2'>
                                            <Icon icon={!checkResult.errors ? 'mdi:shield-check' : 'mdi:alert-circle'} className={`mr-2 text-lg ${!checkResult.errors ? 'text-emerald-400' : 'text-red-400'}`} />
                                            <h4 className={`text-sm font-bold uppercase tracking-wider ${!checkResult.errors ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {!checkResult.errors ? 'Account Valid ✓' : 'Check Error'}
                                            </h4>
                                        </div>
                                        {checkResult.errors ? (
                                            <div className='space-y-1'>
                                                {(Array.isArray(checkResult.errors) ? checkResult.errors : [checkResult.errors]).map((err, i) => (
                                                    <p key={i} className='text-sm text-red-300' dangerouslySetInnerHTML={{ __html: typeof err === 'string' ? err.replace(/<[^>]*>/g, '') : JSON.stringify(err) }} />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className='text-sm text-emerald-300'>Akun telah divalidasi dan siap untuk dibeli.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                <div className='bg-white/5 border border-white/10 p-4 rounded-xl flex items-start'>
                                    <Icon icon='mdi:information-outline' className='text-gray-400 text-xl mr-3 flex-shrink-0' />
                                    <div className='flex flex-col'>
                                        <p className='text-sm text-gray-400 mb-2'>
                                            This record is currently in <span className='text-white font-medium uppercase'>'{getStatusText(selectedOrder.status)}'</span> state. Approval constraints are locked.
                                        </p>
                                        {selectedOrder.loginData && (
                                            <div className='mt-2 p-3 bg-black/40 rounded-lg border border-purple-500/20'>
                                                <p className='text-[10px] uppercase text-purple-400 font-bold mb-1'>Extracted Credentials</p>
                                                <p className='text-xs font-mono text-white break-all'>{selectedOrder.loginData.login}:{selectedOrder.loginData.password}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        handleDeleteOrder(selectedOrder.id)
                                        setSelectedOrder(null)
                                    }}
                                    className='w-full flex items-center justify-center py-3 bg-red-500/5 text-red-500 hover:bg-red-500 border border-red-500/20 hover:text-white rounded-xl font-bold text-sm shadow-none transition-all'
                                >
                                    <Icon icon='mdi:delete-outline' className='mr-2' />
                                    PURGE RECORD
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  )
}

export default AdminPage
