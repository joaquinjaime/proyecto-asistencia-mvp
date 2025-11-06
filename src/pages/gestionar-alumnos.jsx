"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
// ⬇️ --- (CAMBIO: Íconos para los badges) --- ⬇️
import { ArrowLeft, Users, UserPlus, Trash2, Check, X } from "lucide-react"

export default function GestionarAlumnos() {
  const [selectedClass, setSelectedClass] = useState(null)
  const [students, setStudents] = useState([])
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [newStudent, setNewStudent] = useState({ nombre: "", apellido: "", dni: "" })
  const navigate = useNavigate()
  
  // ⬇️ --- (CAMBIO: Estado para los badges de regularidad) --- ⬇️
  const [studentStats, setStudentStats] = useState({})

  // Cargar la clase y sus alumnos al montar
  useEffect(() => {
    const selectedClassId = localStorage.getItem("selectedClassId")
    if (!selectedClassId) {
      navigate("/dashboard")
      return
    }

    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]")
    const currentClass = allClasses.find((c) => c.id === Number.parseInt(selectedClassId))

    if (!currentClass) {
      navigate("/dashboard")
      return
    }

    setSelectedClass(currentClass)
    setStudents(currentClass.alumnos || [])
  }, [navigate])

  // ⬇️ --- (CAMBIO: useEffect para calcular regularidad 75%) --- ⬇️
  useEffect(() => {
    if (!selectedClass) {
      setStudentStats({}) 
      return
    }
    const allAttendances = JSON.parse(localStorage.getItem("attendances") || "[]")
    const allVerificationCodes = JSON.parse(localStorage.getItem("verificationCodes") || "[]")
    
    // 1. Total de clases dictadas (sesiones de QR)
    const classVerificationCodes = allVerificationCodes.filter(
      (vc) => vc.classId === selectedClass.id
    )
    const totalSessionsHeld = new Set(
      classVerificationCodes.map(vc => new Date(vc.createdAt).toLocaleDateString("es-ES"))
    ).size

    if (totalSessionsHeld === 0) {
      const newStats = {}
      if(selectedClass.alumnos) {
        for (const student of selectedClass.alumnos) {
          newStats[student.id] = { percentage: 0, status: "No Regular" }
        }
      }
      setStudentStats(newStats)
      return
    }

    // 2. Calcular stats para cada alumno
    const newStats = {}
    if (selectedClass.alumnos) {
      for (const student of selectedClass.alumnos) {
        const studentAttendances = allAttendances.filter(
          (a) => a.studentDni === student.dni && a.classId === selectedClass.id
        )
        const studentAttendedDays = new Set(studentAttendances.map(a => a.date)).size
        const percentage = Math.round((studentAttendedDays / totalSessionsHeld) * 100)
        const status = percentage >= 75 ? "Regular" : "No Regular"
        newStats[student.id] = { percentage, status }
      }
    }
    setStudentStats(newStats)
  }, [selectedClass, students]) // Recalcula si la lista de alumnos cambia
  // ⬆️ --- (FIN DEL CAMBIO) --- ⬆️

  // (Las funciones 'updateClassStudents', 'handleAddStudent', 'handleDeleteStudent' no cambian)
  const updateClassStudents = (updatedStudents) => {
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]")
    const updatedClasses = allClasses.map((c) => {
      if (c.id === selectedClass.id) {
        return { ...c, alumnos: updatedStudents }
      }
      return c
    })
    localStorage.setItem("classes", JSON.stringify(updatedClasses))
  }
  const handleAddStudent = (e) => {
    e.preventDefault()
    if (!newStudent.nombre || !newStudent.apellido || !newStudent.dni) {
      alert("Por favor completa todos los campos.")
      return
    }
    if (students.some(s => s.dni === newStudent.dni)) {
      alert("Ya existe un alumno con ese DNI en esta asignatura.")
      return
    }
    const studentData = { id: Date.now(), ...newStudent }
    const updatedStudents = [...students, studentData]
    setStudents(updatedStudents)
    updateClassStudents(updatedStudents) 
    setNewStudent({ nombre: "", apellido: "", dni: "" })
    setShowStudentModal(false)
  }
  const handleDeleteStudent = (studentId) => {
    if (confirm("¿Estás seguro de eliminar a este alumno de la asignatura?")) {
      const updatedStudents = students.filter((s) => s.id !== studentId)
      setStudents(updatedStudents)
      updateClassStudents(updatedStudents)
    }
  }

  if (!selectedClass) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* (Header no cambia) */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Gestionar Alumnos</h1>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 btn-secondary rounded-lg font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-modern p-6 sm:p-8 animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{selectedClass.nombre}</h2>
              <p className="text-lg text-gray-600">Lista de Alumnos Inscritos</p>
            </div>
            <button
              onClick={() => setShowStudentModal(true)}
              className="flex items-center gap-2 px-4 py-2 btn-success rounded-lg font-medium"
            >
              <UserPlus className="w-5 h-5" />
              Agregar Alumno
            </button>
          </div>

          <div className="space-y-3">
            {students.length > 0 ? (
              students.map((student, index) => {
                // ⬇️ --- (CAMBIO: Obtenemos el stat de regularidad) --- ⬇️
                const stats = studentStats[student.id]
                return (
                  <div
                    key={student.id}
                    className="flex justify-between items-center p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {student.nombre[0]}
                          {student.apellido[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {student.nombre} {student.apellido}
                        </p>
                        <p className="text-sm text-gray-600">DNI: {student.dni}</p>
                      </div>
                    </div>
                    {/* ⬇️ --- (CAMBIO: Añadido badge de regularidad) --- ⬇️ */}
                    <div className="flex items-center gap-3">
                      {stats ? (
                        stats.status === "Regular" ? (
                          <span className="badge-green flex items-center gap-1" title={`Regular: ${stats.percentage}%`}>
                            <Check className="w-4 h-4" />
                            {stats.percentage}%
                          </span>
                        ) : (
                          <span className="badge-red flex items-center gap-1" title={`No Regular: ${stats.percentage}%`}>
                            <X className="w-4 h-4" />
                            {stats.percentage}%
                          </span>
                        )
                      ) : (
                        <span className="badge-gray" title="Sin asistencias registradas">0%</span>
                      )}
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all"
                        title="Eliminar alumno"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {/* ⬆️ --- (FIN DEL CAMBIO) --- ⬆️ */}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No hay alumnos inscritos en esta clase.</p>
                <p className="text-sm text-gray-400 mt-1">Agrega el primer alumno para comenzar.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* (Modal 'showStudentModal' no cambia) */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-blue-200 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Inscribir Alumno</h2>
            </div>
            <form onSubmit={handleAddStudent} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                <input type="text" value={newStudent.nombre} onChange={(e) => setNewStudent({ ...newStudent, nombre: e.target.value })} className="input-modern focus:ring-green-500 focus:border-green-500" placeholder="Ej: Juan" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Apellido</label>
                <input type="text" value={newStudent.apellido} onChange={(e) => setNewStudent({ ...newStudent, apellido: e.target.value })} className="input-modern focus:ring-green-500 focus:border-green-500" placeholder="Ej: Pérez" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">DNI</label>
                <input type="text" value={newStudent.dni} onChange={(e) => setNewStudent({ ...newStudent, dni: e.target.value })} className="input-modern focus:ring-green-500 focus:border-green-500" placeholder="Ej: 12345678" required />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowStudentModal(false)} className="flex-1 px-4 py-3 btn-secondary rounded-lg font-medium">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 btn-success rounded-lg font-medium">Inscribir Alumno</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}