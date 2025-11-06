"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/login"
import Dashboard from "./pages/dashboard"
import GenerarQR from "./pages/generarQR"
import GestorAsistencias from "./pages/gestorasistencias"
import Register from "./pages/register"
import VerifyAttendance from "./pages/verify-attendance"
import HistorialAsignatura from "./pages/historial-asignatura"
// ⬇️ --- (NUEVA IMPORTACIÓN) --- ⬇️
import GestionarAlumnos from "./pages/gestionar-alumnos"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated")
    setIsAuthenticated(authStatus === "true")
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />}
        />
        <Route path="/generar-qr" element={isAuthenticated ? <GenerarQR /> : <Navigate to="/login" />} />
        <Route
          path="/gestor-asistencias"
          element={isAuthenticated ? <GestorAsistencias /> : <Navigate to="/login" />}
        />
        <Route
          path="/historial-asignatura"
          element={isAuthenticated ? <HistorialAsignatura /> : <Navigate to="/login" />}
        />
        {/* ⬇️ --- (NUEVA RUTA PROTEGIDA) --- ⬇️ */}
        <Route
          path="/gestionar-alumnos"
          element={isAuthenticated ? <GestionarAlumnos /> : <Navigate to="/login" />}
        />
        {/* ⬆️ --- (FIN NUEVA RUTA) --- ⬆️ */}
        <Route path="/verify-attendance" element={<VerifyAttendance />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App