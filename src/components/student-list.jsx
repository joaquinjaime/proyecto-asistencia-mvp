"use client"

import { useState } from "react"
import { QrCode, History, UserPlus } from "lucide-react"
import QRCodeDialog from "./qr-code-dialog"
import AttendanceHistory from "./attendance-history"
import AddStudentDialog from "./add-student-dialog"

export default function StudentList() {
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem("students")
    return saved
      ? JSON.parse(saved)
      : [
          { id: "1", nombre: "Juan", apellido: "Pérez", dni: "12345678" },
          { id: "2", nombre: "María", apellido: "González", dni: "87654321" },
          { id: "3", nombre: "Carlos", apellido: "Rodríguez", dni: "11223344" },
        ]
  })

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showQR, setShowQR] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const handleGenerateQR = (student) => {
    setSelectedStudent(student)
    setShowQR(true)
  }

  const handleShowHistory = (student) => {
    setSelectedStudent(student)
    setShowHistory(true)
  }

  const handleAddStudent = (newStudent) => {
    const student = {
      ...newStudent,
      id: Date.now().toString(),
    }
    const updatedStudents = [...students, student]
    setStudents(updatedStudents)
    localStorage.setItem("students", JSON.stringify(updatedStudents))
  }

  if (showHistory && selectedStudent) {
    return (
      <div>
        <button onClick={() => setShowHistory(false)} className="mb-4 text-blue-600 hover:text-blue-700">
          ← Volver a la lista
        </button>
        <AttendanceHistory studentId={selectedStudent.id} students={students} />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Lista de Alumnos</h2>
        <button
          onClick={() => setShowAddDialog(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <UserPlus size={20} />
          Agregar Alumno
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Nombre</th>
              <th className="text-left py-3 px-4">Apellido</th>
              <th className="text-left py-3 px-4">DNI</th>
              <th className="text-left py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{student.nombre}</td>
                <td className="py-3 px-4">{student.apellido}</td>
                <td className="py-3 px-4">{student.dni}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGenerateQR(student)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                    >
                      <QrCode size={16} />
                      QR
                    </button>
                    <button
                      onClick={() => handleShowHistory(student)}
                      className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 flex items-center gap-1"
                    >
                      <History size={16} />
                      Historial
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <QRCodeDialog student={selectedStudent} isOpen={showQR} onClose={() => setShowQR(false)} />

      <AddStudentDialog isOpen={showAddDialog} onClose={() => setShowAddDialog(false)} onAdd={handleAddStudent} />
    </div>
  )
}
