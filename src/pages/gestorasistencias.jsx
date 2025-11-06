"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, BookOpen, Download, Users, Clock, Trash2 } from "lucide-react"

export default function GestorAsistencias() {
  // ... (Toda la lógica de estados y efectos sin cambios)
  const [selectedClass, setSelectedClass] = useState(null)
  const [classes, setClasses] = useState([])
  const [attendances, setAttendances] = useState([])
  const [message, setMessage] = useState({ type: "", text: "" })
  const navigate = useNavigate()
  useEffect(() => {
    const savedClasses = localStorage.getItem("classes")
    const savedAttendances = localStorage.getItem("attendances")
    const selectedClassId = localStorage.getItem("selectedClassId")
    if (savedClasses) {
      const parsedClasses = JSON.parse(savedClasses)
      setClasses(parsedClasses)
      if (selectedClassId) {
        const clase = parsedClasses.find((c) => c.id === Number.parseInt(selectedClassId))
        if (clase) {
          setSelectedClass(clase)
        }
      }
    }
    if (savedAttendances) {
      setAttendances(JSON.parse(savedAttendances).sort((a, b) => b.id - a.id))
    }
  }, [])
  const handleMarkAttendance = (student) => {
    const timeZone = "America/Argentina/Tucuman"
    const today = new Date().toLocaleDateString("es-ES", { timeZone })
    if (!selectedClass) {
      setMessage({ type: "error", text: "Por favor selecciona una clase primero." })
      return
    }
    const alreadyMarked = attendances.some(
      (att) => att.studentId === student.id && att.date === today && att.classId === selectedClass.id
    )
    if (alreadyMarked) {
      setMessage({ type: "error", text: `${student.nombre} ${student.apellido} ya tiene asistencia registrada hoy.` })
      return
    }
    const attendance = {
      id: Date.now(),
      classId: selectedClass.id,
      className: selectedClass.nombre,
      studentId: student.id,
      studentName: `${student.nombre} ${student.apellido}`,
      dni: student.dni,
      date: today,
      time: new Date().toLocaleTimeString("es-ES", { timeZone }),
    }
    const updatedAttendances = [attendance, ...attendances]
    setAttendances(updatedAttendances)
    localStorage.setItem("attendances", JSON.stringify(updatedAttendances))
    setMessage({ type: "success", text: `Asistencia registrada para ${attendance.studentName}` })
  }
  const handleDeleteAttendance = (attendanceId) => {
    if (!confirm("¿Estás seguro de eliminar este registro de asistencia?")) {
      return
    }
    const updatedAttendances = attendances.filter((att) => att.id !== attendanceId)
    setAttendances(updatedAttendances)
    localStorage.setItem("attendances", JSON.stringify(updatedAttendances))
    setMessage({ type: "info", text: "Registro de asistencia eliminado." })
  }
  const getClassAttendances = () => {
    if (!selectedClass) return []
    return attendances.filter((a) => a.classId === selectedClass.id)
  }
  const getAttendanceStats = () => {
    if (!selectedClass) return { total: 0, percentage: 0 }
    const classAttendances = getClassAttendances()
    const today = new Date().toLocaleDateString("es-ES", { timeZone: "America/Argentina/Tucuman" })
    const todayAttendances = classAttendances.filter(a => a.date === today)
    const uniqueStudentsToday = new Set(todayAttendances.map((a) => a.studentId))
    const totalStudents = selectedClass.alumnos?.length || 0
    return {
      total: uniqueStudentsToday.size,
      totalStudents,
      percentage: totalStudents > 0 ? ((uniqueStudentsToday.size / totalStudents) * 100).toFixed(0) : 0,
    }
  }
  const exportToCSV = () => {
    if (!selectedClass) return
    const classAttendances = getClassAttendances()
    let csv = "Alumno,DNI,Fecha,Hora\n"
    classAttendances.forEach((a) => {
      csv += `${a.studentName},${a.dni},${a.date},${a.time}\n`
    })
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `asistencias-${selectedClass.nombre}-${new Date().toLocaleDateString("es-ES")}.csv`
    link.click()
  }
  const stats = getAttendanceStats()
  // ... (Fin de la lógica)

  return (
    // ⬇️ --- (Fondo actualizado) --- ⬇️
    <div className="min-h-screen bg-gray-100">
      {/* ⬇️ --- (Header actualizado) --- ⬇️ */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Gestor de Asistencias</h1>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 btn-secondary rounded-lg font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedClass ? (
          // ⬇️ --- (Selección de clase actualizada) --- ⬇️
          <div className="card-modern p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Selecciona una Clase</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((clase, index) => (
                <button
                  key={clase.id}
                  onClick={() => setSelectedClass(clase)}
                  className="p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all text-left group animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{clase.nombre}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{clase.descripcion}</p>
                  <p className="text-xs text-gray-500 mt-2">{clase.alumnos?.length || 0} alumnos</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ⬇️ --- (Tarjeta de resumen actualizada) --- ⬇️ */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedClass.nombre}</h2>
                  <p className="text-gray-600 text-sm">{selectedClass.descripcion}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 btn-primary rounded-lg font-bold"
                  >
                    <Download className="w-4 h-4" />
                    Exportar CSV
                  </button>
                  <button
                    onClick={() => setSelectedClass(null)}
                    className="px-4 py-2 btn-secondary rounded-lg"
                  >
                    Cambiar Clase
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                {/* ⬇️ --- (Estadísticas actualizadas) --- ⬇️ */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500 font-medium">Total Alumnos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500 font-medium">Presentes (Hoy)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500 font-medium">% Asistencia (Hoy)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.percentage}%</p>
                </div>
              </div>
            </div>

            {/* ⬇️ --- (Registro manual actualizado) --- ⬇️ */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Registro Manual de Asistencia</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedClass.alumnos?.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {student.nombre} {student.apellido}
                      </p>
                      <p className="text-sm text-gray-600">DNI: {student.dni}</p>
                    </div>
                    <button
                      onClick={() => handleMarkAttendance(student)}
                      className="px-4 py-2 btn-success rounded-lg text-sm"
                    >
                      Marcar
                    </button>
                  </div>
                ))}
                {(!selectedClass.alumnos || selectedClass.alumnos.length === 0) && (
                  <p className="text-gray-500 text-center py-8">No hay alumnos en esta clase</p>
                )}
              </div>
            </div>

            {/* ⬇️ --- (Mensajes de feedback actualizados) --- ⬇️ */}
            {message.text && (
              <div
                className={`my-6 p-4 rounded-lg text-sm font-medium ${
                  message.type === "success"
                    ? "bg-green-100 border border-green-200 text-green-800"
                    : message.type === "error"
                    ? "bg-red-100 border border-red-200 text-red-800"
                    : "bg-blue-100 border border-blue-200 text-blue-800"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* ⬇️ --- (Tabla de historial actualizada) --- ⬇️ */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mt-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Historial de Asistencias - {selectedClass.nombre}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alumno</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getClassAttendances().map((attendance) => (
                      <tr key={attendance.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{attendance.studentName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{attendance.dni}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{attendance.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{attendance.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <button
                            onClick={() => handleDeleteAttendance(attendance.id)}
                            className="p-2 text-red-500/70 hover:bg-red-100 hover:text-red-500 rounded-lg transition-all"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getClassAttendances().length === 0 && (
                  <div className="text-center py-8 text-gray-500">No hay asistencias registradas para esta clase</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}