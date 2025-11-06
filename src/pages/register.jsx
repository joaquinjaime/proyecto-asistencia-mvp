"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
// ⬇️ --- (Importamos los iconos necesarios) --- ⬇️
import { UserPlus, Mail, Lock, User, GraduationCap, BookOpen } from "lucide-react"
import { sendRegistrationEmail } from "../services/emailService.js"

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  })
  const navigate = useNavigate()

  // (La lógica de handleSubmit no cambia)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    if (users.some((u) => u.username === formData.username)) {
      alert("Este nombre de usuario ya está en uso. Por favor elige otro.")
      return
    }
    if (users.some((u) => u.email === formData.email)) {
      alert("Este email ya está registrado. Por favor usa otro.")
      return
    }
    const userData = {
      id: Date.now(),
      ...formData,
      registrationDate: new Date().toISOString(),
    }
    users.push(userData)
    localStorage.setItem("users", JSON.stringify(users))
    try {
      await sendRegistrationEmail({
        email: formData.email,
        firstName: formData.nombre,
        lastName: formData.apellido,
        username: formData.username,
        createdAt: userData.registrationDate,
      })
    } catch (error) {
      console.log("Email notification failed:", error)
    }
    alert("¡Registro exitoso! Ahora puedes iniciar sesión con tu usuario y contraseña.")
    navigate("/login")
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/50">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-blue-700 mb-2">AttendanceHub</h1>
          <p className="text-gray-600">Crea tu cuenta</p>
        </div>

        {/* ⬇️ --- (Aquí comienza el DIV que me mostraste) --- ⬇️ */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 animate-slide-up">
          
          {/* ⬇️ --- (ESTA LÍNEA FALTABA) --- ⬇️ */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Registro</h2>

          {/* ⬇️ --- (Aquí comienza el FORM que me mostraste) --- ⬇️ */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* ⬇️ --- (ESTE BLOQUE FALTABA) --- ⬇️ */}
            {/* ⬇️ --- (CAMBIO: Campos Nombre y Apellido) --- ⬇️ */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  name="nombre"
                  id="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full py-3.5 px-4 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="nombre"
                  className="absolute text-gray-500 duration-300 transform scale-100 top-3.5 left-4 z-0 origin-[0]
                             peer-focus:scale-75 peer-focus:top-0.5 peer-focus:text-blue-600
                             peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:top-0.5"
                >
                  Nombre
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="apellido"
                  id="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="w-full py-3.5 px-4 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="apellido"
                  className="absolute text-gray-500 duration-300 transform scale-100 top-3.5 left-4 z-0 origin-[0]
                             peer-focus:scale-75 peer-focus:top-0.5 peer-focus:text-blue-600
                             peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:top-0.5"
                >
                  Apellido
                </label>
              </div>
            </div>
            {/* ⬆️ --- (FIN DEL BLOQUE FALTANTE) --- ⬆️ */}

            {/* ⬇️ --- (ESTE BLOQUE TAMBIÉN FALTABA) --- ⬇️ */}
            {/* ⬇️ --- (CAMBIO: Campo Email) --- ⬇️ */}
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full py-3.5 pl-12 pr-4 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all peer"
                placeholder=" "
                required
              />
              <label
                htmlFor="email"
                className="absolute text-gray-500 duration-300 transform scale-100 top-3.5 left-12 z-0 origin-[0]
                           peer-focus:scale-75 peer-focus:top-0.5 peer-focus:text-blue-600
                           peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:top-0.5"
              >
                Email
              </label>
            </div>
            {/* ⬆️ --- (FIN DEL BLOQUE FALTANTE) --- ⬆️ */}

            {/* ⬇️ --- (Aquí comienza el comentario que SÍ tenías) --- ⬇️ */}
            {/* ⬇️ --- (CAMBIO: Campo Usuario) --- ⬇️ */}
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full py-3.5 pl-12 pr-4 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all peer"
                placeholder=" "
                required
              />
              <label
                htmlFor="username"
                className="absolute text-gray-500 duration-300 transform scale-100 top-3.5 left-12 z-0 origin-[0]
                           peer-focus:scale-75 peer-focus:top-0.5 peer-focus:text-blue-600
                           peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:top-0.5"
              >
                Usuario
              </label>
            </div>
            {/* ⬆️ --- (FIN DEL CAMBIO) --- ⬆️ */}

            {/* ⬇️ --- (CAMBIO: Campo Contraseña) --- ⬇️ */}
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full py-3.5 pl-12 pr-4 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all peer"
                placeholder=" "
                required
              />
              <label
                htmlFor="password"
                className="absolute text-gray-500 duration-300 transform scale-100 top-3.5 left-12 z-0 origin-[0]
                           peer-focus:scale-75 peer-focus:top-0.5 peer-focus:text-blue-600
                           peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:top-0.5"
              >
                Contraseña
              </label>
            </div>
            {/* ⬆️ --- (FIN DEL CAMBIO) --- ⬆️ */}

            {/* ⬇️ --- (CAMBIO: Campo Confirmar Contraseña) --- ⬇️ */}
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full py-3.5 pl-12 pr-4 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all peer"
                placeholder=" "
                required
              />
              <label
                htmlFor="confirmPassword"
                className="absolute text-gray-500 duration-300 transform scale-100 top-3.5 left-12 z-0 origin-[0]
                           peer-focus:scale-75 peer-focus:top-0.5 peer-focus:text-blue-600
                           peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:top-0.5"
              >
                Confirmar Contraseña
              </label>
            </div>
            {/* ⬆️ --- (FIN DEL CAMBIO) --- ⬆️ */}

            <button
              type="submit"
              className="w-full btn-primary rounded-xl flex items-center justify-center gap-2 px-6 py-3 mt-6"
            >
              <UserPlus className="w-5 h-5" />
              Crear Cuenta
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-500 font-semibold">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}