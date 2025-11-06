"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Users, CheckCircle, XCircle, Clock } from "lucide-react"

export default function HistorialAsignatura() {
  const [selectedClass, setSelectedClass] = useState(null)
  const [attendanceSessions, setAttendanceSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null) 
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const selectedClassId = localStorage.getItem("selectedClassId")
    if (!selectedClassId) {
      navigate("/dashboard") 
      return
    }

    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]")
    const allAttendances = JSON.parse(localStorage.getItem("attendances") || "[]")
    const allVerificationCodes = JSON.parse(localStorage.getItem("verificationCodes") || "[]")

    const currentClass = allClasses.find((c) => c.id === Number.parseInt(selectedClassId))
    if (!currentClass) {
      navigate("/dashboard") 
      return
    }

    setSelectedClass(currentClass)

    // ⬇️ --- (LÓGICA DEL HISTORIAL CORREGIDA) --- ⬇️

    // 1. Filtramos solo los códigos (sesiones) de ESTA clase
    const classVerificationCodes = allVerificationCodes.filter(
      (vc) => vc.classId === currentClass.id
    )

    // 2. Mapeamos cada sesión a un objeto de datos
    const sessions = classVerificationCodes.map(vc => {
      const sessionDate = new Date(vc.createdAt)
      const totalStudents = currentClass.alumnos?.length || 0

      // 3. Buscamos SÓLO los alumnos que asistieron a ESTA sesión (por el ID)
      const attendees = allAttendances.filter(
        (att) => att.verificationCodeId === vc.id
      )
      
      // 4. Contamos asistentes únicos (por si acaso)
      const uniqueAttendeesCount = new Set(attendees.map(a => a.studentDni)).size
      
      return {
        id: vc.id, // ID único de la sesión
        date: sessionDate.toLocaleDateString("es-ES", { timeZone: "America/Argentina/Tucuman" }),
        time: sessionDate.toLocaleTimeString("es-ES", { timeZone: "America/Argentina/Tucuman", hour: '2-digit', minute: '2-digit' }),
        rawDate: sessionDate, // Para ordenar
        attendees: attendees,
        totalStudents: totalStudents,
        percentage: totalStudents > 0 
          ? Math.round((uniqueAttendeesCount / totalStudents) * 100) 
          : 0,
      }
    })
    
    // 5. Ordenamos las sesiones por fecha, de más nueva a más vieja
    const sortedSessions = sessions.sort(
      (a, b) => b.rawDate - a.rawDate
    )
    // ⬆️ --- (FIN DE LA LÓGICA CORREGIDA) --- ⬆️

    setAttendanceSessions(sortedSessions)
    setLoading(false)
  }, [navigate])

  // (renderDetailView no cambia)
  const renderDetailView = () => {
    if (!selectedSession || !selectedClass) return null
    const presentStudents = selectedSession.attendees.map(att => ({ 
      id: att.studentId, 
      nombre: att.studentName, 
      dni: att.studentDni 
    }))
    const absentStudents = selectedClass.alumnos.filter(
      student => !presentStudents.find(p => p.dni === student.dni)
    )
    return (
      <div className="card-modern p-6 sm:p-8 animate-fadeIn">
        <button
          onClick={() => setSelectedSession(null)}
          className="flex items-center gap-2 px-4 py-2 btn-secondary rounded-lg font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Resumen
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Detalle de Asistencia
        </h2>
        {/* ⬇️ --- (Mostramos fecha y hora de la sesión) --- ⬇️ */}
        <p className="text-lg text-gray-600 mb-6 font-medium">
          Fecha: {selectedSession.date} - {selectedSession.time} hs
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-semibold text-green-700 mb-4">
              <CheckCircle className="w-6 h-6" />
              Presentes ({presentStudents.length})
            </h3>
            <div className="space-y-3">
              {presentStudents.length > 0 ? (
                presentStudents.map(student => (
                  <div key={student.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-medium text-gray-800">{student.nombre}</p>
                    <p className="text-sm text-gray-600">DNI: {student.dni}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No hubo alumnos presentes.</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-xl font-semibold text-red-700 mb-4">
              <XCircle className="w-6 h-6" />
              Ausentes ({absentStudents.length})
            </h3>
            <div className="space-y-3">
              {absentStudents.length > 0 ? (
                absentStudents.map(student => (
                  <div key={student.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="font-medium text-gray-800">{student.nombre} {student.apellido}</p>
                    <p className="text-sm text-gray-600">DNI: {student.dni}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No hubo alumnos ausentes.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // (renderSummaryView actualizado para mostrar la hora)
  const renderSummaryView = () => {
    return (
      <div className="card-modern p-6 sm:p-8 animate-fadeIn">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{selectedClass.nombre}</h2>
            <p className="text-lg text-gray-600">Historial de Sesiones (por QR)</p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 btn-secondary rounded-lg font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>

        {attendanceSessions.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay sesiones de asistencia registradas para esta asignatura.</p>
            <p className="text-sm text-gray-400 mt-2">Genera un QR en la página de la asignatura para iniciar una sesión.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attendanceSessions.map(session => (
              <button
                key={session.id} // ⬅️ Usamos el ID de sesión como key
                onClick={() => setSelectedSession(session)}
                className="w-full text-left p-6 bg-gray-50 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xl font-bold text-blue-700 group-hover:text-blue-600">
                      Fecha: {session.date}
                    </p>
                    {/* ⬇️ --- (CAMBIO: Mostramos la hora de la sesión) --- ⬇️ */}
                    <p className="flex items-center gap-1.5 text-sm text-gray-600 font-medium mt-1">
                      <Clock className="w-4 h-4" />
                      Iniciada a las: {session.time} hs
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-800">
                      {session.percentage}%
                    </p>
                    <p className="text-sm font-semibold text-gray-500">Asistencia</p>
                    <p className="text-xs text-gray-500 mt-1">
                      ({session.attendees.length} de {session.totalStudents})
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // (Renderizado Principal no cambia)
  if (loading || !selectedClass) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-blue-600">Historial de Asignatura</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedSession ? renderDetailView() : renderSummaryView()}
      </main>
    </div>
  )
}