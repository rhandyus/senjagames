import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          const userData = userDoc.data()

          if (userData) {
            // Merge Firebase user data with Firestore user data
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              ...userData,
              // Ensure we have the latest auth status
              isEmailVerified: firebaseUser.emailVerified,
              lastLoginAt: new Date().toISOString()
            })

            // Update last login time in Firestore
            try {
              await setDoc(
                doc(db, 'users', firebaseUser.uid),
                {
                  lastLoginAt: new Date().toISOString(),
                  isEmailVerified: firebaseUser.emailVerified
                },
                { merge: true }
              )
            } catch (updateError) {
              console.error('Error updating login timestamp:', updateError)
            }
          } else {
            // User exists in Firebase Auth but not in Firestore
            // Create a basic profile (for existing users who signed up before this update)

            const basicProfile = {
              fullName: firebaseUser.displayName || '',
              email: firebaseUser.email,
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || '',
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              isEmailVerified: firebaseUser.emailVerified,
              accountStatus: 'active',
              purchasedAccounts: [],
              ongoingTransactions: [],
              preferences: { language: 'id', currency: 'IDR', theme: 'dark' },
              stats: { totalPurchases: 0, totalSpent: 0, accountsPurchased: 0 }
            }

            await setDoc(doc(db, 'users', firebaseUser.uid), basicProfile)
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              ...basicProfile
            })
          }
        } catch (error) {
          console.error('Error fetching user data from Firestore:', error)
          // Still set basic user data even if Firestore fails
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
            fullName: firebaseUser.displayName || '',
            accountStatus: 'active'
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signUp = async (email, password, fullName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Save additional user data to Firestore
      try {
        await setDoc(doc(db, 'users', user.uid), {
          // Basic profile information
          fullName,
          email,
          uid: user.uid,

          // Account settings
          displayName: fullName,
          photoURL: null,
          phoneNumber: null,

          // Timestamps
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),

          // Account status
          isEmailVerified: user.emailVerified,
          accountStatus: 'active',

          // E-commerce related data
          purchasedAccounts: [],
          ongoingTransactions: [],
          paymentHistory: [],

          // User preferences
          preferences: {
            language: 'id',
            currency: 'IDR',
            theme: 'dark',
            notifications: {
              email: true,
              push: true,
              marketing: false
            }
          },

          // Shopping cart (if needed for persistence)
          cart: {
            items: [],
            lastUpdated: new Date().toISOString()
          },

          // User statistics
          stats: {
            totalPurchases: 0,
            totalSpent: 0,
            accountsPurchased: 0,
            favoriteCategories: []
          },

          // Security and verification
          security: {
            twoFactorEnabled: false,
            loginAttempts: 0,
            lastPasswordChange: new Date().toISOString()
          },

          // Additional metadata
          metadata: {
            signupSource: 'web',
            userAgent: navigator.userAgent,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            locale: navigator.language
          }
        })
      } catch (firestoreError) {
        console.error('Error saving to Firestore (but user was created):', firestoreError)
        // Don't throw here - user was successfully created
      }

      return user
    } catch (error) {
      console.error('Signup error details:', {
        code: error.code,
        message: error.message,
        customData: error.customData
      })
      throw error
    }
  }

  const signIn = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)

      return result
    } catch (error) {
      console.error('Sign in error details:', {
        code: error.code,
        message: error.message
      })
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const updateUserProfile = async fullName => {
    if (!user) return

    try {
      // Update user profile in Firestore with merge to preserve existing data
      await setDoc(
        doc(db, 'users', user.uid),
        {
          fullName,
          displayName: fullName,
          updatedAt: new Date().toISOString()
          // Only update specific fields, preserve everything else
        },
        { merge: true }
      )

      // Update local user state
      setUser(prev => ({
        ...prev,
        fullName,
        displayName: fullName,
        updatedAt: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateUserProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
