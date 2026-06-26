import { createContext, useContext, useState } from 'react'
import { isAuthenticated, getUser, clearSession } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser())
  const [authenticated, setAuthenticated] = useState(isAuthenticated())

  const loginUser = (userData) => {
    setUser(userData)
    setAuthenticated(true)
  }

  const logoutUser = () => {
    clearSession()
    setUser(null)
    setAuthenticated(false)
  }

  const refreshAuth = () => {
    setUser(getUser())
    setAuthenticated(isAuthenticated())
  }

  return (
    <AuthContext.Provider value={{ user, authenticated, loginUser, logoutUser, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
