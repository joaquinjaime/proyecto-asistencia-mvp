"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { UserCircle, Lock, LogIn, BookOpen } from "lucide-react"

export default function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // (La lógica de handleSubmit no cambia)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u) => u.username === username && u.password === password)

    if (user || (username === "admin" && password === "admin123")) {
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("username", username)
      setIsAuthenticated(true)
      navigate("/dashboard")
    } else {
      setError("Usuario o contraseña incorrectos")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md animate-slideDown">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-blue-700">
              AttendanceHub
            </h1>
          </div>
          <p className="text-gray-600 text-lg font-light">Sistema de Gestión de Asistencias</p>
        </div>

        <div className="card-modern rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ⬇️ --- (CAMBIO #1: Campo de Usuario) --- ⬇️ */}
            <div className="relative">
              {/* 1. Icono: Posicionado a 'top-3.5' para alinear con el padding del input */}
              <UserCircle className="absolute left-4 top-3.5 w-5 h-5 text-blue-500" />
              
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                // 2. Clases: Eliminamos 'input-modern' y pusimos todas las clases manualmente
                //    - 'py-3.5' para alinear con el icono
                //    - 'pl-12' para dejar espacio al icono
                //    - 'pr-4' para el padding derecho
                className="w-full py-3.5 pl-12 pr-4 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all peer"
                placeholder=" " 
                required
              />
              
              {/* 3. Etiqueta: Actualizada para alinearse con 'top-3.5' y flotar a 'top-1.5' */}
              <label
                htmlFor="username"
                className="absolute text-gray-500 duration-300 transform scale-100 top-3.5 left-12 z-0 origin-[0]
                          peer-focus:scale-75 
                          peer-focus:top-0.5 
                          peer-focus:text-blue-600
                          peer-[:not(:placeholder-shown)]:scale-75
                          peer-[:not(:placeholder-shown)]:top-0.5"
              >
                Usuario
              </label>
            </div>
            {/* ⬆️ --- (FIN DEL CAMBIO #1) --- ⬆️ */}

            {/* ⬇️ --- (CAMBIO #2: Campo de Contraseña) --- ⬇️ */}
            <div className="relative">
              {/* 1. Icono: Posicionado a 'top-3.5' */}
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-blue-500" />
              
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // 2. Clases: Mismo cambio que el input de usuario
                className="w-full py-3.5 pl-12 pr-4 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all peer"
                placeholder=" "
                required
              />
              
              {/* 3. Etiqueta: Misma lógica de alineación */}
              <label
                htmlFor="password"
                className="absolute text-gray-500 duration-300 transform scale-100 top-3.5 left-12 z-0 origin-[0]
                          peer-focus:scale-75 
                          peer-focus:top-0.5 
                          peer-focus:text-blue-600
                          peer-[:not(:placeholder-shown)]:scale-75
                          peer-[:not(:placeholder-shown)]:top-0.5"
              >
                Contraseña
              </label>
            </div>
            {/* ⬆️ --- (FIN DEL CAMBIO #2) --- ⬆️ */}


            {error && (
              <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium animate-slideDown">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 px-4 rounded-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="text-blue-600 hover:text-blue-500 font-semibold transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3 font-semibold uppercase tracking-wider">
              Credenciales de prueba
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-700 text-center font-mono">
                <span className="text-blue-600 font-semibold">Usuario:</span> admin
              </p>
              <p className="text-sm text-gray-700 text-center font-mono">
                <span className="text-blue-600 font-semibold">Contraseña:</span> admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}