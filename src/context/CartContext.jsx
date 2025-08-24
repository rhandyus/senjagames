import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { getPriceValue, convertToIDR } from '../utils/currency'

const CartContext = createContext()

// Cart actions
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
}

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const existingItem = state.items.find(item => item.id === action.payload.id)

      // For gaming accounts, don't allow duplicates - each account is unique
      if (existingItem) {
        // Return state unchanged if item already exists
        return state
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      }
    }

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      }

    case CART_ACTIONS.UPDATE_QUANTITY:
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id)
        }
      }

      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        )
      }

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: []
      }

    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        items: action.payload.items || []
      }

    default:
      return state
  }
}

// Initial state
const initialState = {
  items: []
}

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('senjagames_cart')
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart)
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData })
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('senjagames_cart', JSON.stringify(state))
  }, [state])

  // Cart actions
  const addToCart = item => {
    const existingItem = state.items.find(cartItem => cartItem.id === item.id)

    if (existingItem) {
      // Item already in cart - return false to indicate no addition
      return false
    }

    dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: item })
    return true // Successfully added
  }

  const removeFromCart = itemId => {
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: { id: itemId } })
  }

  const updateQuantity = (itemId, quantity) => {
    dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { id: itemId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART })
  }

  // Computed values
  const totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = state.items.reduce((total, item) => {
    const priceUSD = getPriceValue(item)
    const priceIDR = convertToIDR(priceUSD)
    return total + priceIDR * item.quantity
  }, 0)

  const contextValue = {
    items: state.items,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
}

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export default CartContext
