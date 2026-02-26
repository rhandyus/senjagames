import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetMessage, setResetMessage] = useState('')

  const { signIn, resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(formData.email, formData.password)

      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)

      // Provide user-friendly error messages
      let errorMessage = 'Login gagal. Silakan periksa kredensial Anda.'

      if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'Konfigurasi Firebase tidak ditemukan. Silakan hubungi administrator.'
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Email tidak terdaftar. Silakan daftar terlebih dahulu.'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Password salah. Silakan coba lagi.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid.'
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Akun telah dinonaktifkan. Silakan hubungi administrator.'
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Koneksi internet bermasalah. Silakan coba lagi.'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Terlalu banyak percobaan. Silakan tunggu beberapa menit.'
      }

      setError(errorMessage)
    }

    setLoading(false)
  }

  const handleResetPassword = async e => {
    e.preventDefault()
    if (!formData.email) {
      setError('Silakan masukkan email Anda untuk reset password.')
      return
    }

    setError('')
    setResetMessage('')
    setLoading(true)

    try {
      await resetPassword(formData.email)
      setResetMessage('Link reset password telah dikirim ke email Anda.')
    } catch (error) {
      console.error('Reset password error:', error)
      let errorMessage = 'Gagal mengirim link reset password.'

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Email tidak terdaftar.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid.'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Terlalu banyak percobaan. Silakan tunggu beberapa menit.'
      }

      setError(errorMessage)
    }

    setLoading(false)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full'>
        {/* Logo/Brand */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-purple-400 mb-2'>SenjaGames.id</h1>
          <div className='w-16 h-1 bg-gradient-to-r from-purple-500 to-purple-700 mx-auto rounded-full'></div>
        </div>

        {/* Login Card */}
        <div className='bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-8'>
          <div className='mb-6'>
            <h2 className='text-2xl font-bold text-white text-center mb-2'>
              {isResettingPassword ? 'Reset Password' : 'Masuk ke Akun Anda'}
            </h2>
            <p className='text-center text-gray-400'>
              {isResettingPassword ? (
                'Masukkan email Anda untuk menerima link reset.'
              ) : (
                <>
                  Atau{' '}
                  <Link
                    to='/signup'
                    className='font-medium text-purple-400 hover:text-purple-300 transition-colors'
                  >
                    daftar akun baru
                  </Link>
                </>
              )}
            </p>
          </div>

          <form className='space-y-6' onSubmit={isResettingPassword ? handleResetPassword : handleSubmit}>
            {error && (
              <div className='bg-red-900/50 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm'>
                {error}
              </div>
            )}
            {resetMessage && (
              <div className='bg-green-900/50 border border-green-700/50 text-green-300 px-4 py-3 rounded-lg backdrop-blur-sm'>
                {resetMessage}
              </div>
            )}

            <div className='space-y-5'>
              <div>
                <label htmlFor='email' className='block text-sm font-medium text-gray-300 mb-2'>
                  Email
                </label>
                <input
                  id='email'
                  name='email'
                  type='email'
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-gray-700 transition-all duration-200'
                  placeholder='Masukkan email Anda'
                />
              </div>

              {!isResettingPassword && (
                <div>
                  <div className='flex justify-between items-center mb-2'>
                    <label htmlFor='password' className='block text-sm font-medium text-gray-300'>
                      Password
                    </label>
                    <button
                      type='button'
                      onClick={() => {
                        setIsResettingPassword(true)
                        setError('')
                        setResetMessage('')
                      }}
                      className='text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium'
                    >
                      Lupa password?
                    </button>
                  </div>
                  <input
                    id='password'
                    name='password'
                    type='password'
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-gray-700 transition-all duration-200'
                    placeholder='Masukkan password Anda'
                  />
                </div>
              )}
            </div>

            <div className='space-y-4'>
              <button
                type='submit'
                disabled={loading}
                className='w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]'
              >
                {loading ? (
                  <div className='flex items-center justify-center'>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    {isResettingPassword ? 'Mengirim...' : 'Masuk...'}
                  </div>
                ) : (
                  isResettingPassword ? 'Kirim Link Reset' : 'Masuk'
                )}
              </button>

              {isResettingPassword && (
                <button
                  type='button'
                  onClick={() => {
                    setIsResettingPassword(false)
                    setError('')
                    setResetMessage('')
                  }}
                  className='w-full py-3 px-4 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200'
                >
                  Kembali ke Login
                </button>
              )}
            </div>

            <div className='text-center pt-4'>
              <Link
                to='/'
                className='text-sm text-gray-400 hover:text-purple-400 transition-colors'
              >
                ← Kembali ke Beranda
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
