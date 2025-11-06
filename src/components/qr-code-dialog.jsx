"use client"

import { useRef } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { X, Download } from "lucide-react"

export default function QRCodeDialog({ student, isOpen, onClose }) {
  const qrRef = useRef(null)

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas")
    if (canvas) {
      const url = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `QR-${student.nombre}-${student.apellido}.png`
      link.href = url
      link.click()
    }
  }

  if (!isOpen || !student) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Código QR</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="text-center space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-lg mb-2">
              {student.nombre} {student.apellido}
            </p>
            <p className="text-gray-600">DNI: {student.dni}</p>
          </div>

          <div ref={qrRef} className="flex justify-center p-4 bg-white">
            <QRCodeCanvas value={student.id} size={256} level="H" includeMargin={true} />
          </div>

          <button
            onClick={handleDownload}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Descargar QR
          </button>
        </div>
      </div>
    </div>
  )
}
