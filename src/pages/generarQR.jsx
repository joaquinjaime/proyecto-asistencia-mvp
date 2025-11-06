"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { QRCodeCanvas } from "qrcode.react"
// ⬇️ --- (Ya no necesitamos Trash2) --- ⬇️
import { ArrowLeft, QrCode, Download, Users, BookOpen, Key, Check, X, XCircle } from "lucide-react"

export default function GenerarQR() {
  const [selectedClass, setSelectedClass] = useState(null)
  const [classes, setClasses] = useState([])
  const [qrData, setQrData] = useState(null)
  const [verificationCode, setVerificationCode] = useState("")
  const navigate = useNavigate()
  const qrRef = useRef()
  const [showQRModal, setShowQRModal] = useState(false)

  // ⬇️ --- (CAMBIO: Estado de 'studentStats' ELIMINADO) --- ⬇️
  // ⬇️ --- (CAMBIO: Nuevo estado para la asistencia de ESTA SESIÓN) --- ⬇️
  const [sessionAttendance, setSessionAttendance] = useState(new Set())
  const [lastAttendanceUpdate, setLastAttendanceUpdate] = useState(null)

  // (useEffect para cargar la clase y el QR persistente no cambia)
  useEffect(() => {
    const savedClasses = localStorage.getItem("classes")
    const selectedClassId = localStorage.getItem("selectedClassId")
    if (savedClasses) {
      const parsedClasses = JSON.parse(savedClasses)
      setClasses(parsedClasses)
      if (selectedClassId) {
        const clase = parsedClasses.find((c) => c.id === Number.parseInt(selectedClassId))
        if (clase) {
          setSelectedClass(clase)
          const activeSession = JSON.parse(localStorage.getItem("activeSession") || "null")
          if (activeSession && activeSession.classId === clase.id) {
            setQrData(activeSession)
          }
        }
      }
    }
  }, []) 

  // ⬇️ --- (CAMBIO: Este useEffect ahora carga la asistencia de la sesión) --- ⬇️
  useEffect(() => {
    // Si no hay QR activo, la lista de asistencia está vacía.
    if (!qrData) {
      setSessionAttendance(new Set())
      return
    }

    // Si hay un QR activo, buscamos a los alumnos que asistieron a ESTA sesión
    const allAttendances = JSON.parse(localStorage.getItem("attendances") || "[]")
    
    // Usamos el 'verificationCodeId' que AHORA guardamos en qrData
    const attendeesForThisSession = allAttendances.filter(
      (att) => att.verificationCodeId === qrData.verificationCodeId
    )
    
    const attendeesSet = new Set(attendeesForThisSession.map(att => att.studentDni))
    setSessionAttendance(attendeesSet)

  }, [qrData, lastAttendanceUpdate]) // Se ejecuta si cambia el QR o si marcamos a alguien
  // ⬆️ --- (FIN DEL CAMBIO) --- ⬆️


  // (Funciones de QR)
  const handleGenerateCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    setVerificationCode(code)
  }
  const handleGenerateQR = () => {
    if (!selectedClass) return
    setShowQRModal(true)
    setVerificationCode("")
  }

  // ⬇️ --- (CAMBIO: 'handleConfirmGenerate' ahora guarda el ID de la sesión) --- ⬇️
  const handleConfirmGenerate = () => {
    const timeZone = "America/Argentina/Tucuman"
    if (!verificationCode) {
      alert("Por favor genera el código de 4 dígitos primero")
      return
    }
    
    // 1. Creamos el código de verificación (la sesión)
    const verificationCodes = JSON.parse(localStorage.getItem("verificationCodes") || "[]")
    const newVerificationCode = {
      id: `vc-${Date.now()}`, // ⬅️ ESTE ES EL ID DE SESIÓN
      code: verificationCode,
      classId: selectedClass.id,
      className: selectedClass.nombre,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      active: true,
    }
    verificationCodes.push(newVerificationCode)
    localStorage.setItem("verificationCodes", JSON.stringify(verificationCodes))

    const appUrl = `${window.location.origin}/verify-attendance?code=${verificationCode}&class=${selectedClass.id}`

    // 2. Creamos el objeto qrData
    const qrInfo = {
      classId: selectedClass.id,
      className: selectedClass.nombre,
      date: new Date().toLocaleDateString("es-ES", { timeZone }),
      timestamp: Date.now(),
      appUrl: appUrl,
      verificationCode: verificationCode,
      verificationCodeId: newVerificationCode.id, // ⬅️ GUARDAMOS EL ID DE SESIÓN
    }

    setQrData(qrInfo)
    setShowQRModal(false)
    localStorage.setItem("activeSession", JSON.stringify(qrInfo)) // Guardamos la sesión completa
    alert(
      `✅ ¡QR generado exitosamente!\n\nCódigo de verificación: ${verificationCode}\n\nComparte este código con tus alumnos.`
    )
  }
  // ⬆️ --- (FIN DEL CAMBIO) --- ⬆️

  // ⬇️ --- (CAMBIO: 'handleEndSession' usa el ID de sesión) --- ⬇️
  const handleEndSession = () => {
    if (!qrData) return; 
    if (confirm("¿Estás seguro de finalizar la sesión de asistencia?\nEl código QR y el código de 4 dígitos dejarán de ser válidos.")) {
      const allCodes = JSON.parse(localStorage.getItem("verificationCodes") || "[]");
      const updatedCodes = allCodes.map(vc => 
        vc.id === qrData.verificationCodeId // Usamos el ID de sesión
        ? { ...vc, active: false } 
        : vc
      );
      localStorage.setItem("verificationCodes", JSON.stringify(updatedCodes));
      localStorage.removeItem("activeSession");
      setQrData(null);
      navigate("/dashboard");
    }
  }
  // ⬆️ --- (FIN DEL CAMBIO) --- ⬆️

  const handleDownloadQR = () => {
    if (!qrRef.current) return
    const canvas = qrRef.current.querySelector("canvas")
    if (canvas) {
      const url = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `QR-${selectedClass.nombre}-${new Date().toLocaleDateString("es-ES")}.png`
      link.href = url
      link.click()
    }
  }
  
  // ⬇️ --- (CAMBIO: 'handleManualMark' ahora se vincula a la sesión) --- ⬇️
  const handleManualMark = (student) => {
    // 1. Debe haber una sesión de QR activa para marcar manualmente aquí
    if (!qrData) {
      alert("No hay una sesión de QR activa. Genere un QR primero o use el 'Gestor de Asistencias'.");
      return;
    }

    if (confirm(`¿Estás seguro de que quieres registrar la asistencia manual para ${student.nombre} ${student.apellido} en ESTA sesión?`)) {
      const timeZone = "America/Argentina/Tucuman";
      const today = new Date().toLocaleDateString("es-ES", { timeZone });
      const now = new Date().toLocaleTimeString("es-ES", { timeZone });

      const allAttendances = JSON.parse(localStorage.getItem("attendances") || "[]");
      
      // 2. Revisar si ya está presente EN ESTA SESIÓN
      const alreadyMarked = allAttendances.some(
        (att) => att.verificationCodeId === qrData.verificationCodeId && att.studentDni === student.dni
      );

      if (alreadyMarked) {
        alert(`${student.nombre} ${student.apellido} ya tiene la asistencia registrada para esta sesión.`);
        return;
      }

      // 3. Crear el nuevo registro CON el ID de la sesión
      const newAttendance = {
        id: Date.now(),
        studentId: student.id,
        studentName: `${student.nombre} ${student.apellido}`,
        studentDni: student.dni,
        classId: selectedClass.id,
        className: selectedClass.nombre,
        timestamp: new Date().toISOString(),
        date: today,
        time: now,
        verificationCodeId: qrData.verificationCodeId, // ⬅️ VINCULADO A LA SESIÓN
      };

      allAttendances.unshift(newAttendance);
      localStorage.setItem("attendances", JSON.stringify(allAttendances));
      alert(`Asistencia registrada manualmente para ${student.nombre} ${student.apellido}.`);

      // 4. Refrescar los badges
      setLastAttendanceUpdate(Date.now());
    }
  }
  // ⬆️ --- (FIN DEL CAMBIO) --- ⬆️


  return (
    <div className="min-h-screen bg-gray-100">
      {/* (Header no cambia) */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Generar QR</h1>
                <p className="text-sm text-gray-600">Código de asistencia</p>
              </div>
            </div>
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
        {/* (Selección de clase no cambia) */}
        {!selectedClass ? (
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
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{clase.alumnos?.length || 0} alumnos</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6 animate-fade-in">
              {/* (Tarjeta de 'Generar QR' no cambia) */}
              <div className="card-modern p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedClass.nombre}</h2>
                    <p className="text-gray-600">{selectedClass.descripcion}</p>
                  </div>
                  <button
                    onClick={() => setSelectedClass(null)}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    Cambiar
                  </button>
                </div>
                <button
                  onClick={handleGenerateQR}
                  disabled={!!qrData}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 btn-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <QrCode className="w-5 h-5" />
                  {qrData ? "Sesión de QR activa" : "Generar QR para esta Clase"}
                </button>
              </div>

              {/* ⬇️ --- (Tarjeta de Alumnos SIMPLIFICADA) --- ⬇️ */}
              <div className="card-modern p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-700" />
                    <h3 className="text-lg font-bold text-gray-900">Alumnos de la Asignatura</h3>
                  </div>
                  <button
                    onClick={() => navigate("/gestionar-alumnos")}
                    className="flex items-center gap-2 px-4 py-2 btn-secondary rounded-lg text-sm font-medium"
                  >
                    Gestionar Lista
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {selectedClass.alumnos?.map((student, index) => {
                    // ⬇️ --- (CAMBIO: Lógica del badge actualizada) --- ⬇️
                    const isPresent = sessionAttendance.has(student.dni);
                    return (
                      <div
                        key={student.id}
                        onClick={() => handleManualMark(student)}
                        className={`flex justify-between items-center p-4 border rounded-xl transition-all animate-slide-up cursor-pointer ${
                          isPresent ? "bg-green-50 border-green-200" : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isPresent ? "bg-green-100" : "bg-blue-100"
                          }`}>
                            <span className={`font-semibold text-sm ${
                              isPresent ? "text-green-700" : "text-blue-600"
                            }`}>
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
                        <div className="flex items-center gap-3">
                          {/* ⬇️ --- (CAMBIO: Badge de "Presente" / "Ausente") --- ⬇️ */}
                          {qrData ? ( // Solo mostramos el estado si hay una sesión activa
                            isPresent ? (
                              <span className="badge-green flex items-center gap-1">
                                <Check className="w-4 h-4" />
                                Presente
                              </span>
                            ) : (
                              <span className="badge-gray flex items-center gap-1">
                                <X className="w-4 h-4" />
                                Ausente
                              </span>
                            )
                          ) : (
                            <span className="badge-gray" title="Inicie una sesión de QR para ver el estado">
                              -
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {/* ⬆️ --- (FIN DEL CAMBIO) --- ⬆️ */}
                  {(!selectedClass.alumnos || selectedClass.alumnos.length === 0) && (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No hay alumnos en esta clase</p>
                      <p className="text-sm text-gray-400 mt-1">Ve a "Gestionar Lista" para añadirlos.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* (Panel de QR no cambia) */}
            <div className="card-modern p-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Código de Asistencia</h2>
              {qrData && (
                <div className="text-center">
                  <div className="mb-6 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                    <p className="text-xl font-bold text-gray-900 mb-1">{qrData.className}</p>
                    <p className="text-sm text-gray-600 mb-3">Fecha: {qrData.date}</p>
                    <div className="bg-green-100 border-2 border-green-200 rounded-xl p-4 mb-3">
                      <p className="text-sm font-semibold text-green-700 mb-1">Código de Verificación:</p>
                      <p className="text-4xl font-bold text-green-800 tracking-wider">{qrData.verificationCode}</p>
                      <p className="text-xs text-green-600 mt-2">Comparte este código con tus alumnos</p>
                    </div>
                    <p className="text-xs text-gray-600 bg-gray-100 px-4 py-2 rounded-lg inline-block">
                      Al escanear, los alumnos ingresan su DNI y el código para registrar asistencia
                    </p>
                  </div>
                  <div
                    ref={qrRef}
                    className="flex justify-center mb-6 bg-white p-8 rounded-2xl border-2 border-gray-200 shadow-inner"
                  >
                    <QRCodeCanvas value={qrData.appUrl} size={280} level="H" includeMargin={true} />
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={handleDownloadQR}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 btn-success rounded-lg font-semibold"
                    >
                      <Download className="w-5 h-5" />
                      Descargar QR
                    </button>
                    <button
                      onClick={() => setQrData(null)}
                      className="w-full px-6 py-3 btn-secondary rounded-lg font-medium"
                    >
                      Ocultar QR (Generar Nuevo)
                    </button>
                    <button
                      onClick={handleEndSession}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 btn-danger rounded-lg font-semibold"
                    >
                      <XCircle className="w-5 h-5" />
                      Finalizar Sesión
                    </button>
                  </div>
                </div>
              )}
              {!qrData && (
                <div className="flex items-center justify-center h-[500px] text-gray-400">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                      <QrCode className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-500 mb-2">Haz clic en "Generar QR"</p>
                    <p className="text-sm text-gray-400">para crear el código de asistencia</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* (Modal de 'showQRModal' no cambia) */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-blue-200 animate-slide-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Configurar QR</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Código de Verificación</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verificationCode}
                    readOnly
                    className="flex-1 px-4 py-3 input-modern text-center text-2xl tracking-wider cursor-not-allowed"
                    placeholder="----"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="px-6 py-3 btn-primary rounded-lg shadow-lg flex items-center gap-2"
                  >
                    <Key className="w-5 h-5" />
                    Generar
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Genera un código de 4 dígitos para verificar asistencia</p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 px-4 py-3 btn-secondary rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmGenerate}
                  className="flex-1 px-4 py-3 btn-primary rounded-lg shadow-lg"
                >
                  Generar QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}