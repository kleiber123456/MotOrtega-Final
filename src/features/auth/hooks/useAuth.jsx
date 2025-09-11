"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    const userData = localStorage.getItem("usuario") || sessionStorage.getItem("usuario")

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing user data:", error)
        logout()
      }
    }
    setLoading(false)
  }, [])

  const login = (userData, token, remember = false) => {
    const storage = remember ? localStorage : sessionStorage

    storage.setItem("token", token)
    storage.setItem("usuario", JSON.stringify(userData))

    setUser(userData)

    // Redirigir según el rol del usuario
    redirectByRole(userData.rol || userData.rol_nombre)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("usuario")

    setUser(null)
    navigate("/")
  }

  const redirectByRole = (role) => {
    const roleLower = role?.toLowerCase()

    if (roleLower?.includes("cliente")) {
      navigate("/client/dashboard")
    } else if (roleLower?.includes("mecánico") || roleLower?.includes("mecanico")) {
      navigate("/mechanic/citas")
    } else if (roleLower?.includes("admin") || roleLower?.includes("recepcionista")) {
      navigate("/dashboard")
    } else {
      navigate("/dashboard") // Default fallback
    }
  }

  const hasRole = (allowedRoles) => {
    if (!user || !allowedRoles.length) return false

    const userRole = user.rol || user.rol_nombre
    return allowedRoles.some((role) => userRole?.toLowerCase().includes(role.toLowerCase()))
  }

  const value = {
    user,
    login,
    logout,
    loading,
    hasRole,
    redirectByRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
