import { Calendar } from "lucide-react"

export default function AttendanceHistory({ studentId, students }) {
  const attendances = JSON.parse(localStorage.getItem("attendances") || "[]")
  const student = students.find((s) => s.id === studentId)

  const studentAttendances = attendances
    .filter((a) => a.studentId === studentId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  if (!student) return null

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">
        Historial de Asistencias - {student.nombre} {student.apellido}
      </h2>

      {studentAttendances.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No hay asistencias registradas</p>
      ) : (
        <div className="space-y-2">
          {studentAttendances.map((attendance, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="text-blue-600" size={20} />
              <div>
                <p className="font-medium">
                  {new Date(attendance.timestamp).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-gray-600">{new Date(attendance.timestamp).toLocaleTimeString("es-ES")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
