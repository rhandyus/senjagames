import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Signup = () => {
  const [step, setStep] = useState(1) // 1: form, 2: otp verification
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const { signUp } = useAuth()
  const navigate = useNavigate()

  // Development OTP code
  const DEV_OTP = import.meta.env.VITE_DEV_OTP_CODE || '123456'

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok')
      return
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    // Move to OTP step
    setStep(2)
    setShowTooltip(true)

    // Hide tooltip after 5 seconds
    setTimeout(() => {
      setShowTooltip(false)
    }, 5000)
  }

  const handleOtpSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Check OTP
    if (otp !== DEV_OTP) {
      setError('Kode OTP tidak valid')
      setLoading(false)
      return
    }

    try {
      await signUp(formData.email, formData.password, formData.fullName)

      navigate('/dashboard')
    } catch (error) {
      console.error('Signup error:', error)

      // Provide user-friendly error messages
      let errorMessage = 'Pendaftaran gagal. Silakan coba lagi.'

      if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'Konfigurasi Firebase tidak ditemukan. Silakan hubungi administrator.'
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage =
          'Email sudah digunakan. Silakan gunakan email lain atau masuk ke akun yang sudah ada.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid.'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password terlalu lemah. Gunakan minimal 6 karakter.'
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Koneksi internet bermasalah. Silakan coba lagi.'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Terlalu banyak percobaan. Silakan tunggu beberapa menit.'
      }

      setError(errorMessage)
    }

    setLoading(false)
  }

  const handleBackToForm = () => {
    setStep(1)
    setOtp('')
    setError('')
    setShowTooltip(false)
  }

  if (step === 2) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full'>
          {/* Logo/Brand */}
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-purple-400 mb-2'>SenjaGames.id</h1>
            <div className='w-16 h-1 bg-gradient-to-r from-purple-500 to-purple-700 mx-auto rounded-full'></div>
          </div>

          {/* OTP Card */}
          <div className='bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-8'>
            <div className='mb-6'>
              <h2 className='text-2xl font-bold text-white text-center mb-2'>Verifikasi OTP</h2>
              <p className='text-center text-gray-400'>
                Masukkan kode OTP yang dikirim ke email Anda
              </p>
            </div>

            {/* Development Tooltip */}
            {showTooltip && (
              <div className='mb-6'>
                <div className='bg-yellow-900/50 border border-yellow-600/50 text-yellow-200 p-4 rounded-lg backdrop-blur-sm'>
                  <div className='flex items-start'>
                    <svg
                      className='h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <div>
                      <p className='font-medium text-sm'>Development Mode</p>
                      <p className='text-sm mt-1'>
                        Gunakan kode OTP:{' '}
                        <span className='font-mono font-bold text-yellow-100'>{DEV_OTP}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form className='space-y-6' onSubmit={handleOtpSubmit}>
              {error && (
                <div className='bg-red-900/50 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm'>
                  {error}
                </div>
              )}

              <div>
                <label htmlFor='otp' className='block text-sm font-medium text-gray-300 mb-2'>
                  Kode OTP
                </label>
                <input
                  id='otp'
                  name='otp'
                  type='text'
                  required
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-gray-700 transition-all duration-200 text-center text-lg tracking-widest font-mono'
                  placeholder='000000'
                  maxLength='6'
                />
              </div>

              <div className='flex space-x-4'>
                <button
                  type='button'
                  onClick={handleBackToForm}
                  className='flex-1 py-3 px-4 border border-gray-600 text-sm font-medium rounded-lg text-gray-300 bg-gray-700/50 hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200'
                >
                  Kembali
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]'
                >
                  {loading ? (
                    <div className='flex items-center justify-center'>
                      <svg
                        className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
                      Verifikasi...
                    </div>
                  ) : (
                    'Verifikasi'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full'>
        {/* Logo/Brand */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-purple-400 mb-2'>SenjaGames.id</h1>
          <div className='w-16 h-1 bg-gradient-to-r from-purple-500 to-purple-700 mx-auto rounded-full'></div>
        </div>

        {/* Signup Card */}
        <div className='bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-8'>
          <div className='mb-6'>
            <h2 className='text-2xl font-bold text-white text-center mb-2'>Daftar Akun Baru</h2>
            <p className='text-center text-gray-400'>
              Atau{' '}
              <Link
                to='/login'
                className='font-medium text-purple-400 hover:text-purple-300 transition-colors'
              >
                masuk ke akun yang sudah ada
              </Link>
            </p>
          </div>

          <form className='space-y-6' onSubmit={handleSubmit}>
            {error && (
              <div className='bg-red-900/50 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm'>
                {error}
              </div>
            )}

            <div className='space-y-5'>
              <div>
                <label htmlFor='fullName' className='block text-sm font-medium text-gray-300 mb-2'>
                  Nama Lengkap
                </label>
                <input
                  id='fullName'
                  name='fullName'
                  type='text'
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-gray-700 transition-all duration-200'
                  placeholder='Masukkan nama lengkap Anda'
                />
              </div>

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

              <div>
                <label htmlFor='password' className='block text-sm font-medium text-gray-300 mb-2'>
                  Password
                </label>
                <input
                  id='password'
                  name='password'
                  type='password'
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-gray-700 transition-all duration-200'
                  placeholder='Minimal 6 karakter'
                />
              </div>

              <div>
                <label
                  htmlFor='confirmPassword'
                  className='block text-sm font-medium text-gray-300 mb-2'
                >
                  Konfirmasi Password
                </label>
                <input
                  id='confirmPassword'
                  name='confirmPassword'
                  type='password'
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-gray-700 transition-all duration-200'
                  placeholder='Ulangi password Anda'
                />
              </div>
            </div>

            <button
              type='submit'
              className='w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]'
            >
              Lanjut ke Verifikasi
            </button>

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

export default Signup
