import emailjs from "emailjs-com"

// ⚠️ IMPORTANTE: Reemplaza estos valores con tus credenciales reales de EmailJS
// Obtén tus credenciales en: https://dashboard.emailjs.com/
const EMAILJS_SERVICE_ID = "service_mvpsanti" // Ejemplo: "service_abc123"
const EMAILJS_TEMPLATE_ID_REGISTER = "template_abcd123" // Ejemplo: "template_xyz789"
// --- Constante ELIMINADA ---
// Se eliminó 'EMAILJS_TEMPLATE_ID_VERIFICATION'
const EMAILJS_PUBLIC_KEY = "YDG7ef1PGzJup06x6" // Ejemplo: "user_1234567890"

// --- FUNCIÓN MODIFICADA ---
// Se limpió 'isEmailJSConfigured' para no chequear el template de verificación
const isEmailJSConfigured = () => {
  return (
    EMAILJS_SERVICE_ID !== "service_mvpsanti" &&
    EMAILJS_TEMPLATE_ID_REGISTER !== "template_abcd123" && // Se mantiene el chequeo del template de registro
    EMAILJS_PUBLIC_KEY !== "YDG7ef1PGzJup06x6"
  )
}

/**
 * Envía un email de confirmación de registro
 * @param {Object} user - Datos del usuario registrado
 * @returns {Promise<Object>} - Resultado del envío
 */
export const sendRegistrationEmail = async (user) => {
  if (!isEmailJSConfigured()) {
    console.warn("[v0] ⚠️ EmailJS no configurado - Saltando envío de email de registro")
    return { success: false, error: new Error("EmailJS no configurado"), skipped: true }
  }

  try {
    const templateParams = {
      to_email: user.email,
      to_name: `${user.firstName} ${user.lastName}`,
      username: user.username,
      registration_date: new Date(user.createdAt).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_REGISTER,
      templateParams,
      EMAILJS_PUBLIC_KEY,
    )

    console.log("[v0] ✅ Email de registro enviado exitosamente:", response)
    return { success: true, response }
  } catch (error) {
    console.error("[v0] ❌ Error al enviar email de registro:", error)
    return { success: false, error }
  }
}
