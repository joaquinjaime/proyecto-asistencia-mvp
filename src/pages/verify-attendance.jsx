"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { CheckCircle, XCircle, QrCode, User, Key, Clock, BookOpen } from "lucide-react"

export default function VerifyAttendance() {
  // ... (Toda la lógica de estados y efectos sin cambios)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [dni, setDni] = useState("")
  const [code, setCode] = useState("")
  const [classId, setClassId] = useState(null)
  const [className, setClassName] = useState("")
  const [status, setStatus] = useState("idle")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const urlCode = searchParams.get("code")
    const urlClassId = searchParams.get("class")
    if (urlCode) {
      setCode(urlCode)
    }
    if (urlClassId) {
      setClassId(urlClassId)
      const classes = JSON.parse(localStorage.getItem("classes") || "[]")
      const foundClass = classes.find((c) => c.id === Number.parseInt(urlClassId))
      if (foundClass) {
        setClassName(foundClass.nombre)
      }
    }
  }, [searchParams])
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus("loading")
    await new Promise((resolve) => setTimeout(resolve, 800))
    const verificationCodes = JSON.parse(localStorage.getItem("verificationCodes") || "[]")
    const validCode = verificationCodes.find(
      (vc) =>
        vc.code === code && vc.classId === Number.parseInt(classId) && vc.active && new Date(vc.expiresAt) > new Date(),
    )
    if (!validCode) {
      setStatus("error")
      setMessage("Código inválido o expirado. Por favor verifica con tu profesor.")
      setIsLoading(false)
      return
    }
    const classes = JSON.parse(localStorage.getItem("classes") || "[]")
    const currentClass = classes.find((c) => c.id === Number.parseInt(classId))
    if (!currentClass) {
      setStatus("error")
      setMessage("Clase no encontrada.")
      setIsLoading(false)
      return
    }
    const student = currentClass.alumnos?.find((a) => a.dni === dni)
    if (!student) {
      setStatus("error")
      setMessage("DNI no encontrado en esta clase. Verifica tu DNI o contacta a tu profesor.")
      setIsLoading(false)
      return
    }
    const attendances = JSON.parse(localStorage.getItem("attendances") || "[]")
    const alreadyRegistered = attendances.some(
      (att) => att.studentId === student.id && att.verificationCodeId === validCode.id,
    )
    if (alreadyRegistered) {
      setStatus("error")
      setMessage("Ya registraste tu asistencia con este código.")
      setIsLoading(false)
      return
    }
    const timeZone = "America/Argentina/Tucuman"
    const newAttendance = {
      id: Date.now(),
      studentId: student.id,
      studentName: `${student.nombre} ${student.apellido}`,
      studentDni: student.dni,
      classId: Number.parseInt(classId),
      className: currentClass.nombre,
      verificationCodeId: validCode.id,
      verificationCode: code,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString("es-ES", { timeZone }),
      time: new Date().toLocaleTimeString("es-ES", { timeZone }),
    }
    attendances.push(newAttendance)
    localStorage.setItem("attendances", JSON.stringify(attendances))
    setStatus("success")
    setMessage(
      `¡Asistencia registrada exitosamente!\n\nAlumno: ${student.nombre} ${student.apellido}\nClase: ${currentClass.nombre}\nFecha: ${newAttendance.date}\nHora: ${newAttendance.time}`,
    )
    setIsLoading(false)
    setTimeout(() => {
      setDni("")
      setStatus("idle")
      setMessage("")
    }, 5000)
  }
  // ... (Fin de la lógica)
  
  return (
    // ⬇️ --- (Fondo actualizado) --- ⬇️
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* ⬇️ --- (Icono actualizado) --- ⬇️ */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4 shadow-lg shadow-blue-500/30">
            <QrCode className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-blue-700 mb-2">Verificar Asistencia</h1>
          <p className="text-gray-600 text-lg">AttendanceHub</p>
        </div>

        {/* ⬇️ --- (Tarjeta actualizada) --- ⬇️ */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {className && (
            // ⬇️ --- (Badge de clase actualizado) --- ⬇️
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700">
                <BookOpen className="w-5 h-5" />
                <p className="font-semibold">{className}</p>
              </div>
            </div>
          )}

          {status === "idle" || status === "loading" ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="dni" className="block text-sm font-semibold text-gray-700">
                  Tu DNI
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="dni"
                    name="dni"
                    type="text"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    className="input-modern pl-11"
                    placeholder="Ej: 12345678"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="code" className="block text-sm font-semibold text-gray-700">
                  Código de Verificación
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="code"
                    name="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="input-modern pl-11 font-bold text-center text-2xl tracking-widest"
                    placeholder="----"
                    maxLength={4}
                    required
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500">Ingresa el código de 4 dígitos proporcionado por tu profesor</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 px-4 rounded-lg flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Registrar Asistencia</span>
                  </>
                )}
              </button>
            </form>
          ) : status === "success" ? (
            // ⬇️ --- (Mensaje de éxito actualizado) --- ⬇️
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">¡Asistencia Registrada!</h2>
              <p className="text-gray-700 whitespace-pre-line">{message}</p>
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-green-700 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Esta ventana se cerrará automáticamente</span>
                </div>
              </div>
            </div>
          ) : (
            // ⬇️ --- (Mensaje de error actualizado) --- ⬇️
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Error</h2>
              <p className="text-gray-700 mb-6">{message}</p>
              <button
                onClick={() => {
                  setStatus("idle")
                  setMessage("")
                  setDni("")
                }}
                className="px-6 py-3 btn-primary rounded-lg"
              >
                Intentar de Nuevo
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          {/* ⬇️ --- (Texto de pie de página actualizado) --- ⬇️ */}
          <p className="text-gray-500 text-sm">
            ¿Problemas con el código?{" "}
            <button onClick={() => navigate("/login")} className="text-gray-700 font-semibold hover:underline">
              Contacta a tu profesor
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}