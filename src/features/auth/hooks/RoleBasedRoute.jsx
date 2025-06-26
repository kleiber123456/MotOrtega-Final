import { Navigate } from "react-router-dom"

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  const userData = localStorage.getItem("usuario") || sessionStorage.getItem("usuario")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (!userData) {
    return <Navigate to="/login" replace />
  }

  const user = JSON.parse(userData)
  const userRole = user.rol || user.rol_nombre

  // Si no se especifican roles permitidos, permitir acceso
  if (allowedRoles.length === 0) {
    return children
  }

  // Verificar si el rol del usuario está en los roles permitidos
  const hasPermission = allowedRoles.some((role) => userRole?.toLowerCase().includes(role.toLowerCase()))

  if (!hasPermission) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default RoleBasedRoute
