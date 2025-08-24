import React, { useState } from 'react'
import { Icon } from '@iconify/react'
import { useCart } from '../context/CartContext'
import PaymentModal from './PaymentModal'
import { getPriceValue, convertToIDR, formatCurrency } from '../utils/currency'

const CartModal = ({ isOpen, onClose }) => {
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart()
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, item: null })

  if (!isOpen) return null

  const handleBuyNow = item => {
    setPaymentModal({ isOpen: true, item, quantity: item.quantity })
  }

  const handleCheckoutAll = () => {
    // For multiple items, we'll create a combined order
    // Calculate total USD price for PaymentModal (since it does its own IDR conversion)
    if (items.length > 0) {
      const totalUSD = items.reduce((total, item) => {
        const priceUSD = getPriceValue(item)
        return total + priceUSD * item.quantity
      }, 0)

      const combinedItem = {
        id: 'bulk-order-' + Date.now(),
        title: `Bulk Order (${totalItems} items)`,
        price: totalUSD.toString(), // Send USD price to PaymentModal
        quantity: 1
      }
      setPaymentModal({ isOpen: true, item: combinedItem, quantity: 1 })
    }
  }

  return (
    <>
      <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
        <div className='bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl'>
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-800'>
            <div className='flex items-center'>
              <Icon icon='mdi:shopping-cart' className='text-2xl text-purple-400 mr-3' />
              <h2 className='text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
                Keranjang Belanja
              </h2>
              <span className='ml-2 bg-purple-600 text-white text-sm px-2 py-1 rounded-full'>
                {totalItems}
              </span>
            </div>
            <button onClick={onClose} className='text-gray-400 hover:text-white transition-colors'>
              <Icon icon='mdi:close' className='text-2xl' />
            </button>
          </div>

          {/* Cart Content */}
          <div className='flex flex-col h-full max-h-[calc(90vh-200px)]'>
            {items.length === 0 ? (
              // Empty Cart
              <div className='flex-1 flex flex-col items-center justify-center p-8 text-center'>
                <div className='bg-gray-800/50 rounded-full w-20 h-20 flex items-center justify-center mb-4'>
                  <Icon icon='mdi:cart-outline' className='text-4xl text-gray-400' />
                </div>
                <h3 className='text-lg font-medium text-white mb-2'>Keranjang Kosong</h3>
                <p className='text-gray-400 mb-6'>Belum ada item yang ditambahkan ke keranjang</p>
                <button
                  onClick={onClose}
                  className='bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200'
                >
                  Mulai Belanja
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className='flex-1 overflow-y-auto p-6 space-y-4'>
                  {items.map(item => {
                    const priceUSD = getPriceValue(item)
                    const priceIDR = convertToIDR(priceUSD)
                    const itemTotal = priceIDR * item.quantity

                    return (
                      <div
                        key={item.id}
                        className='bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-purple-500/50 transition-all duration-200'
                      >
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <h4 className='font-medium text-white mb-1'>
                              {item.title || 'Gaming Account'}
                            </h4>
                            <div className='mb-3'>
                              <p className='text-sm text-white font-medium'>
                                {formatCurrency(priceIDR)} × {item.quantity}
                              </p>
                              <p className='text-xs text-gray-400'>
                                ${priceUSD} USD × {item.quantity}
                              </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className='flex items-center space-x-3'>
                              <div className='flex items-center bg-gray-700 rounded-lg'>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className='p-2 text-gray-300 hover:text-white transition-colors'
                                >
                                  <Icon icon='mdi:minus' />
                                </button>
                                <span className='px-4 py-2 text-white font-medium min-w-[3rem] text-center'>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className='p-2 text-gray-300 hover:text-white transition-colors'
                                >
                                  <Icon icon='mdi:plus' />
                                </button>
                              </div>

                              <button
                                onClick={() => handleBuyNow(item)}
                                className='bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200'
                              >
                                Beli Sekarang
                              </button>
                            </div>
                          </div>

                          <div className='text-right ml-4'>
                            <div className='text-lg font-bold text-purple-400 mb-2'>
                              {formatCurrency(itemTotal)}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className='text-red-400 hover:text-red-300 transition-colors'
                            >
                              <Icon icon='mdi:delete-outline' className='text-xl' />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Footer */}
                <div className='border-t border-gray-800 p-6'>
                  <div className='flex justify-between items-center mb-4'>
                    <span className='text-lg font-medium text-gray-300'>Total:</span>
                    <div className='text-right'>
                      <div className='text-2xl font-bold text-purple-400'>
                        {formatCurrency(totalPrice)}
                      </div>
                      <div className='text-sm text-gray-400'>
                        $
                        {items
                          .reduce((total, item) => {
                            const priceUSD = getPriceValue(item)
                            return total + priceUSD * item.quantity
                          }, 0)
                          .toFixed(2)}{' '}
                        USD
                      </div>
                    </div>
                  </div>

                  <div className='flex space-x-3'>
                    <button
                      onClick={clearCart}
                      className='flex-1 bg-gray-800 text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors border border-gray-700'
                    >
                      Kosongkan Keranjang
                    </button>
                    <button
                      onClick={handleCheckoutAll}
                      className='flex-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-purple-500/25'
                    >
                      Checkout Semua ({totalItems} item)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, item: null })}
        item={paymentModal.item}
        quantity={paymentModal.quantity}
      />
    </>
  )
}

export default CartModal
