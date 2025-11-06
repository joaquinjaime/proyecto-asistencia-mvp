"use client"

import { useState } from "react"
import { CheckCircle, XCircle } from "lucide-react"

export default function AttendanceScanner({ students, onAttendanceMarked }) {
  const [qrInput, setQrInput] = useState("")
  const [message, setMessage] = useState(null)

  const handleScan = (e) => {
    e.preventDefault()

    if (!qrInput.trim()) {
      setMessage({ type: "error", text: "Por favor ingresa un código QR" })
      return
    }

    const student = students.find((s) => s.id === qrInput)

    if (student) {
      const attendance = {
        studentId: student.id,
        studentName: `${student.nombre} ${student.apellido}`,
        timestamp: new Date().toISOString(),
      }

      const attendances = JSON.parse(localStorage.getItem("attendances") || "[]")
      attendances.push(attendance)
      localStorage.setItem("attendances", JSON.stringify(attendances))

      setMessage({
        type: "success",
        text: `Asistencia registrada para ${student.nombre} ${student.apellido}`,
      })

      if (onAttendanceMarked) {
        onAttendanceMarked(attendance)
      }

      setQrInput("")
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage({ type: "error", text: "Código QR no válido" })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Registrar Asistencia</h2>

      <form onSubmit={handleScan} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Escanea o ingresa el código QR del alumno</label>
          <input
            type="text"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            placeholder="Ingresa el código del QR"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
          Registrar Asistencia
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  )
}
