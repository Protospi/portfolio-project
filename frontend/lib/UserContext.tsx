'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface UserContextProps {
  userId: string | null
  setUserId: (id: string) => void
}

const UserContext = createContext<UserContextProps>({
  userId: null,
  setUserId: () => {}
})

export function useUser() {
  return useContext(UserContext)
}

interface UserProviderProps {
  children: React.ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null)

  // Check for userId in localStorage on initial load
  useEffect(() => {
    try {
      // Only run on client side
      if (typeof window !== 'undefined') {
        const storedUserId = localStorage.getItem('portfolioUserId')
        if (storedUserId) {
          console.log('Retrieved user ID from localStorage:', storedUserId)
          setUserId(storedUserId)
        } else {
          console.log('No user ID found in localStorage')
        }
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error)
    }
  }, [])

  const handleSetUserId = (id: string) => {
    if (!id) {
      console.error('Attempted to set undefined/null user ID')
      return
    }
    
    try {
      console.log('Setting user ID:', id)
      setUserId(id)
      localStorage.setItem('portfolioUserId', id)
    } catch (error) {
      console.error('Error setting user ID in localStorage:', error)
      // Still update the state even if localStorage fails
      setUserId(id)
    }
  }

  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId: handleSetUserId
      }}
    >
      {children}
    </UserContext.Provider>
  )
} 