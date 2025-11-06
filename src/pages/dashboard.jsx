"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  LogOut,
  Plus,
  Users,
  QrCode,
  ClipboardList,
  Clock,
  MapPin,
  GraduationCap,
  Trash2,
  UserX,
  Settings,
  TrendingUp,
  BookOpen,
  Building,
  CalendarClock, // ⬅️ --- (NUEVO ÍCONO IMPORTADO) ---
  Coffee, // ⬅️ --- (NUEVO ÍCONO IMPORTADO) ---
} from "lucide-react"
// ⬇️ --- (CircularProgress ya no se usa en esta página) --- ⬇️
// import CircularProgress from "../components/CircularProgress"

// (Función helper getTucumanTime no cambia)
const getTucumanTime = () => {
  return new Date().toLocaleTimeString("es-ES", {
    timeZone: "America/Argentina/Tucuman",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

// ⬇️ --- (NUEVA FUNCIÓN HELPER) --- ⬇️
// Para convertir "HH:MM" a minutos totales del día
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}
// Días de la semana en español para coincidir con el <select>
const daysInSpanish = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function Dashboard({ setIsAuthenticated }) {
  const [classes, setClasses] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [newClass, setNewClass] = useState({
    nombre: "",
    descripcion: "",
    institucion: "",
    dia: "",
    horarioInicio: "",
    horarioFin: "",
    aula: "",
    año: "",
  })
  const [activeSession, setActiveSession] = useState(null)
  
  // ⬇️ --- (CAMBIO: Estado de 'stats' modificado) --- ⬇️
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    // 'attendancePercentage' ya no se usa aquí
  })
  // ⬇️ --- (NUEVO ESTADO para la próxima clase) --- ⬇️
  const [nextClass, setNextClass] = useState(null);

  const [currentTime, setCurrentTime] = useState(getTucumanTime())
  const navigate = useNavigate()
  const username = localStorage.getItem("username") || "Profesor"

  // (useEffect del reloj no cambia)
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(getTucumanTime())
    }, 1000)
    return () => clearInterval(timerId)
  }, [])

  // ⬇️ --- (CAMBIO: useEffect principal modificado) --- ⬇️
  useEffect(() => {
    const savedClasses = JSON.parse(localStorage.getItem("classes") || "[]")
    const attendances = JSON.parse(localStorage.getItem("attendances") || "[]")
    setClasses(savedClasses)

    // --- Cálculo de Estadísticas (Alumnos y Clases) ---
    const allStudents = savedClasses.flatMap((c) => c.alumnos || [])
    const totalStudentCount = new Set(allStudents.map((s) => s.dni)).size
    
    setStats({
      totalClasses: savedClasses.length,
      totalStudents: totalStudentCount,
    })

    // --- Cálculo de Próxima Asignatura ---
    const now = new Date();
    const todayName = daysInSpanish[now.getDay()]; // ej: "Jueves"
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes(); // ej: 14:30 -> 870

    const upcomingClassesToday = savedClasses
      .filter(c => c.dia === todayName) // Filtra por hoy
      .filter(c => timeToMinutes(c.horarioInicio) > currentTimeInMinutes) // Filtra por hora futura
      .sort((a, b) => timeToMinutes(a.horarioInicio) - timeToMinutes(b.horarioInicio)); // Ordena por la más próxima

    if (upcomingClassesToday.length > 0) {
      setNextClass(upcomingClassesToday[0]); // Establece la más próxima
    } else {
      setNextClass(null); // No hay más clases hoy
    }
    
    // --- Sesión Activa ---
    const session = localStorage.getItem("activeSession")
    if (session) {
      setActiveSession(JSON.parse(session))
    }
  }, [classes]) // Dependencia 'classes'
  // ⬆️ --- (FIN DEL CAMBIO) --- ⬆️

  // (El resto de las funciones (logout, delete, add, etc.) no cambian)
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    setIsAuthenticated(false)
    navigate("/login")
  }
  const handleDeleteAccount = () => {
    const currentUser = localStorage.getItem("username")
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const updatedUsers = users.filter((user) => user.username !== currentUser)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
    localStorage.removeItem("classes")
    localStorage.removeItem("attendances")
    localStorage.removeItem("activeSession")
    localStorage.removeItem("selectedClassId")
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("username")
    setIsAuthenticated(false)
    navigate("/login")
  }
  const handleAddClass = (e) => {
    e.preventDefault()
    if (
      !newClass.nombre || !newClass.año || !newClass.institucion ||
      !newClass.dia || !newClass.horarioInicio || !newClass.horarioFin || !newClass.aula
    ) {
      alert("Por favor completa todos los campos requeridos")
      return
    }
    const newClassData = { 
      id: Date.now(), 
      ...newClass, 
      profesor: username, 
      alumnos: [] 
    }
    const updatedClasses = [...classes, newClassData]
    setClasses(updatedClasses)
    localStorage.setItem("classes", JSON.stringify(updatedClasses))
    setNewClass({
      nombre: "", descripcion: "", institucion: "", dia: "",
      horarioInicio: "", horarioFin: "", aula: "", año: "",
    })
    setShowAddModal(false)
    alert("Asignatura agregada exitosamente")
  }
  const handleDeleteClass = (id) => {
    if (confirm("¿Estás seguro de eliminar esta clase?")) {
      const updatedClasses = classes.filter((c) => c.id !== id)
      setClasses(updatedClasses)
      localStorage.setItem("classes", JSON.stringify(updatedClasses))
    }
  }
  const handleSelectClass = (classId) => {
    localStorage.setItem("selectedClassId", classId)
    navigate("/generar-qr")
  }
  const handleViewHistory = (classId) => {
    localStorage.setItem("selectedClassId", classId)
    navigate("/historial-asignatura")
  }
  const handleManageStudents = (classId) => {
    localStorage.setItem("selectedClassId", classId)
    navigate("/gestionar-alumnos")
  }
  const handleStartAttendance = () => {
    navigate("/generar-qr")
  }
  const handleViewAttendances = () => {
    navigate("/gestor-asistencias")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* (Header, bienvenida no cambian) */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-blue-700">
                ATTENDANCEHUB
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-800 font-mono">{currentTime}</span>
                <span className="text-xs text-gray-500">ART</span>
              </div>
              <p className="text-sm text-gray-600 hidden sm:block font-medium">
                Bienvenido, <span className="text-blue-600">{username}</span>
              </p>
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="flex items-center gap-2 px-4 py-2 btn-secondary rounded-lg transition-all"
                >
                  <Settings className="w-4 h-4" />
                  Cuenta
                </button>
                {showAccountMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => { setShowAccountMenu(false); handleLogout(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-gray-700 transition-all text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={() => { setShowAccountMenu(false); setShowDeleteAccountModal(true); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-all text-left"
                    >
                      <UserX className="w-4 h-4" />
                      Eliminar Cuenta
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16 animate-slideDown">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">Sistema de Control de Asistencias</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-blue-700 mb-4">
            PANEL DE CONTROL
          </h2>
          <p className="text-xl text-gray-600 mb-10 font-light">Gestión de asistencia en tiempo real</p>
          <div className="flex flex-wrap justify-center gap-4">
            {!activeSession ? (
              <button
                onClick={handleStartAttendance}
                className="inline-flex items-center gap-3 px-8 py-4 btn-primary text-lg rounded-lg"
              >
                <QrCode className="w-6 h-6" />
                Iniciar Asistencia
              </button>
            ) : (
              <div className="inline-block bg-green-50 border-2 border-green-200 px-6 py-3 rounded-xl shadow-lg">
                <p className="text-green-700 font-semibold mb-1">Sesión activa</p>
                <p className="text-green-600 text-sm">Iniciada: {activeSession.time}</p>
                <button
                  onClick={() => navigate("/generar-qr")}
                  className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all text-sm font-medium"
                >
                  Ver QR
                </button>
              </div>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-3 px-8 py-4 btn-secondary text-lg font-bold rounded-lg"
            >
              <Plus className="w-6 h-6" />
              Agregar Asignatura
            </button>
            <button
              onClick={handleViewAttendances}
              className="inline-flex items-center gap-3 px-8 py-4 btn-secondary text-lg font-bold rounded-lg"
            >
              <ClipboardList className="w-6 h-6" />
              Ver Asistencias
            </button>
          </div>
        </div>

        {/* ⬇️ --- (CAMBIO: Recuadros de Estadísticas actualizados) --- ⬇️ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          {/* --- RECUADRO 1: PRÓXIMA ASIGNATURA --- */}
          <div className="card-modern rounded-2xl shadow-xl p-8 border-2 border-gray-200 hover:border-blue-400 transition-all hover:shadow-blue-500/20">
            {/* Verificamos si encontramos una próxima clase */}
            {nextClass ? (
              <div className="flex flex-col h-full">
                <p className="font-semibold text-gray-500 uppercase tracking-wider text-xs mb-3">Próxima Asignatura (Hoy)</p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CalendarClock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{nextClass.nombre}</h3>
                    <p className="text-sm text-gray-600">{nextClass.institucion}</p>
                  </div>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{nextClass.horarioInicio} - {nextClass.horarioFin} hs</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Aula {nextClass.aula}</span>
                  </div>
                </div>
                {/* Botón de atajo */}
                <button 
                  onClick={() => handleSelectClass(nextClass.id)}
                  className="w-full btn-primary rounded-lg py-3 mt-auto pt-4"
                >
                  Ir a la Asignatura
                </button>
              </div>
            ) : (
              // Mensaje si no hay más clases hoy
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Coffee className="w-12 h-12 text-gray-400 mb-4" />
                <span className="text-2xl font-bold text-gray-900 mb-2">Jornada Finalizada</span>
                <p className="font-semibold text-gray-500 uppercase tracking-wider text-xs">No tienes más clases hoy</p>
              </div>
            )}
          </div>
          {/* --- FIN RECUADRO 1 --- */}

          {/* --- RECUADRO 2: ALUMNOS REGISTRADOS --- */}
          <div className="card-modern rounded-2xl shadow-xl p-8 border-2 border-gray-200 hover:border-blue-400 transition-all hover:shadow-blue-500/20">
            <div className="flex flex-col items-center justify-center">
              <Users className="w-12 h-12 text-blue-600 mb-4" />
              <span className="text-5xl font-bold text-gray-900 mb-2">{stats.totalStudents}</span>
              <p className="font-semibold text-gray-500 uppercase tracking-wider text-xs">Alumnos Registrados</p>
              <div className="mt-4 px-3 py-1 bg-blue-100 rounded-full">
                <p className="text-blue-700 text-xs font-medium">Total en el sistema</p>
              </div>
            </div>
          </div>
          {/* --- FIN RECUADRO 2 --- */}
          
          {/* --- RECUADRO 3: ASIGNATURAS ACTIVAS --- */}
          <div className="card-modern rounded-2xl shadow-xl p-8 border-2 border-gray-200 hover:border-blue-400 transition-all hover:shadow-blue-500/20">
            <div className="flex flex-col items-center justify-center">
              <GraduationCap className="w-12 h-12 text-blue-600 mb-4" />
              <span className="text-5xl font-bold text-gray-900 mb-2">{stats.totalClasses}</span>
              <p className="font-semibold text-gray-500 uppercase tracking-wider text-xs">Asignaturas Activas</p>
              <div className="mt-4 px-3 py-1 bg-blue-100 rounded-full">
                <p className="text-blue-700 text-xs font-medium">En curso</p>
              </div>
            </div>
          </div>
          {/* --- FIN RECUADRO 3 --- */}

        </div>
        {/* ⬆️ --- (FIN DEL CAMBIO) --- ⬆️ */}


        {/* (Sección "Mis Asignaturas" no cambia) */}
        <div className="card-modern rounded-2xl shadow-xl p-8 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold text-gray-900">Mis Asignaturas</h3>
              <p className="text-gray-600 text-sm mt-1">Gestiona tus clases y estudiantes</p>
            </div>
            {classes.length > 0 && (
              <div className="px-4 py-2 bg-blue-100 rounded-lg">
                <p className="text-blue-700 font-semibold">
                  {classes.length} clase{classes.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
          {classes.length === 0 ? (
            <div className="text-center py-16">
              <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
              <p className="text-gray-500 text-lg mb-4">No hay asignaturas aún</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 btn-primary rounded-lg"
              >
                <Plus className="w-5 h-5" />
                Crear tu primera asignatura
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((clase) => (
                <div
                  key={clase.id}
                  onClick={() => handleSelectClass(clase.id)}
                  className="p-6 bg-gray-50 border-2 border-gray-200 rounded-2xl hover:border-blue-500 transition-all cursor-pointer group hover:shadow-lg hover:shadow-blue-100 active:scale-95"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleManageStudents(clase.id); }}
                        className="p-2 text-blue-500/60 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-all"
                        title="Gestionar alumnos"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewHistory(clase.id); }}
                        className="p-2 text-blue-500/60 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-all"
                        title="Ver historial de asistencia"
                      >
                        <ClipboardList className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteClass(clase.id); }}
                        className="p-2 text-red-500/50 hover:bg-red-100 hover:text-red-500 rounded-lg transition-all"
                        title="Eliminar asignatura"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-blue-600 transition-colors">
                    {clase.nombre}
                  </h4>
                  <p className="text-sm font-semibold text-blue-700 mb-2">{clase.institucion}</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">{clase.descripcion}</p>
                  <div className="space-y-3 text-sm border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Building className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{clase.profesor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-xs">
                        {clase.dia} {clase.horarioInicio} - {clase.horarioFin}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-xs">
                        Aula {clase.aula} • {clase.año}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-600 font-semibold">{clase.alumnos?.length || 0}</span>
                      <span className="text-gray-500 text-xs">alumnos</span>
                    </div>
                    <QrCode className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* (Modales no cambian) */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-red-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Eliminar Cuenta</h2>
            </div>
            <div className="mb-6">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
                <p className="text-red-700 font-semibold mb-2">⚠️ Advertencia</p>
                <p className="text-red-600 text-sm mb-2">¿Estás seguro de que quieres eliminar tu cuenta?</p>
                <p className="text-red-600 text-sm">Esta acción es permanente y se eliminarán:</p>
                <ul className="text-red-600 text-sm mt-2 ml-4 list-disc">
                  <li>Tu cuenta de usuario</li>
                  <li>Todas tus asignaturas</li>
                  <li>Todos los registros de asistencia</li>
                  <li>Toda la información asociada</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(false)}
                className="flex-1 px-4 py-3 btn-secondary rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-3 btn-danger rounded-lg font-medium"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Nueva Asignatura</h2>
            </div>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Asignatura *</label>
                <input type="text" value={newClass.nombre} onChange={(e) => setNewClass({ ...newClass, nombre: e.target.value })} className="input-modern" placeholder="Ej: Matemáticas 101" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                <input type="text" value={newClass.descripcion} onChange={(e) => setNewClass({ ...newClass, descripcion: e.target.value })} className="input-modern" placeholder="Ej: Álgebra y Geometría" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Institución *</label>
                <input type="text" value={newClass.institucion} onChange={(e) => setNewClass({ ...newClass, institucion: e.target.value })} className="input-modern" placeholder="Ej: Universidad Nacional" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Año *</label>
                  <select value={newClass.año} onChange={(e) => setNewClass({ ...newClass, año: e.target.value })} className="input-modern" required>
                    <option value="">Seleccionar año</option>
                    <option value="1º Año">1º Año</option>
                    <option value="2º Año">2º Año</option>
                    <option value="3º Año">3º Año</option>
                    <option value="4º Año">4º Año</option>
                    <option value="5º Año">5º Año</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Día *</label>
                  <select value={newClass.dia} onChange={(e) => setNewClass({ ...newClass, dia: e.target.value })} className="input-modern" required>
                    <option value="">Seleccionar día</option>
                    <option value="Lunes">Lunes</option>
                    <option value="Martes">Martes</option>
                    <option value="Miércoles">Miércoles</option>
                    <option value="Jueves">Jueves</option>
                    <option value="Viernes">Viernes</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Horario Inicio *</label>
                  <input type="time" value={newClass.horarioInicio} onChange={(e) => setNewClass({ ...newClass, horarioInicio: e.target.value })} className="input-modern" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Horario Fin *</label>
                  <input type="time" value={newClass.horarioFin} onChange={(e) => setNewClass({ ...newClass, horarioFin: e.target.value })} className="input-modern" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Aula/Laboratorio *</label>
                <input type="text" value={newClass.aula} onChange={(e) => setNewClass({ ...newClass, aula: e.target.value })} className="input-modern" placeholder="Ej: A4, Lab. 2, Auditorio" required />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 btn-secondary rounded-lg font-medium">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 btn-primary rounded-lg font-bold">Agregar Asignatura</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}