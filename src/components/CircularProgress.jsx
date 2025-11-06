import { useState, useEffect } from "react"

export default function CircularProgress({
  size = 120,
  strokeWidth = 10,
  percentage = 0,
  label = "",
  color = "#2563eb", // ⬇️ --- (Color por defecto cambiado a azul) --- ⬇️
}) {
  const [progress, setProgress] = useState(0)
  const viewBox = `0 0 ${size} ${size}`
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const dashOffset = circumference - (progress / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => setProgress(percentage), 500)
    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={viewBox}
          className="-rotate-90"
        >
          {/* ⬇️ --- (Color de fondo del círculo actualizado) --- ⬇️ */}
          <circle
            className="text-gray-200" // Era text-slate-700
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={`${strokeWidth}px`}
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={`${strokeWidth}px`}
            stroke={color}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {/* ⬇️ --- (Fuente y color del texto actualizados) --- ⬇️ */}
          <span className="text-2xl font-bold text-gray-900">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
      {/* ⬇️ --- (Color del label actualizado) --- ⬇️ */}
      <p className="font-semibold text-gray-500 uppercase tracking-widest text-xs">{label}</p>
    </div>
  )
}