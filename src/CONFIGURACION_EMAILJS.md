# Configuración de EmailJS para AttendanceHub

## Resumen de los 3 problemas y soluciones

### 1. ❌ Problema: Los emails no llegan
**Causa:** Las credenciales de EmailJS son placeholders ("YOUR_SERVICE_ID", etc.)

**Solución:** Debes configurar tu cuenta de EmailJS siguiendo los pasos a continuación.

### 2. ✅ Problema: No se pueden agregar asignaturas
**Solución:** Corregido. Ahora el formulario valida todos los campos y muestra alertas de confirmación.

### 3. ✅ Problema: Flujo del QR incorrecto
**Solución:** Ahora el QR redirige DIRECTAMENTE al Google Forms. El código de 4 dígitos se envía por email y debe ingresarse en el Google Forms.

---

## Paso 1: Crear cuenta en EmailJS

1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Haz clic en "Sign Up" y crea una cuenta gratuita
3. Verifica tu email

## Paso 2: Configurar un servicio de email

1. En el dashboard de EmailJS, ve a "Email Services"
2. Haz clic en "Add New Service"
3. Selecciona tu proveedor de email (Gmail, Outlook, etc.)
4. Sigue las instrucciones para conectar tu cuenta
5. **Copia el SERVICE ID** que aparece (ejemplo: "service_abc123")

## Paso 3: Crear templates de email

### Template 1: Confirmación de Registro

1. Ve a "Email Templates" → "Create New Template"
2. Nombre: "Confirmación de Registro"
3. Contenido del template:

\`\`\`
Asunto: ¡Bienvenido a AttendanceHub!

Hola {{to_name}},

¡Tu cuenta ha sido creada exitosamente!

Detalles de tu cuenta:
- Usuario: {{username}}
- Fecha de registro: {{registration_date}}

Ahora puedes iniciar sesión en AttendanceHub y comenzar a gestionar la asistencia de tus clases.

Saludos,
El equipo de AttendanceHub
\`\`\`

4. **Copia el TEMPLATE ID** (ejemplo: "template_xyz789")

### Template 2: Código de Verificación

1. Crea otro template nuevo
2. Nombre: "Código de Verificación de Asistencia"
3. Contenido del template:

\`\`\`
Asunto: Código de Verificación - {{class_name}}

Hola,

Se ha generado un código QR para la clase: {{class_name}}

Tu código de verificación es: {{verification_code}}

Detalles:
- Fecha: {{date}}
- Hora: {{time}}

Este código debe ser ingresado en el Google Forms al escanear el QR para confirmar la asistencia.

Saludos,
AttendanceHub
\`\`\`

4. **Copia el TEMPLATE ID** (ejemplo: "template_abc456")

## Paso 4: Obtener tu Public Key

1. Ve a "Account" → "General"
2. Busca "Public Key"
3. **Copia tu PUBLIC KEY** (ejemplo: "user_1234567890abcdef")

## Paso 5: Actualizar el código

Abre el archivo `src/services/emailService.js` y reemplaza los valores:

\`\`\`javascript
const EMAILJS_SERVICE_ID = "service_abc123" // Tu Service ID
const EMAILJS_TEMPLATE_ID_REGISTER = "template_xyz789" // Template de registro
const EMAILJS_TEMPLATE_ID_VERIFICATION = "template_abc456" // Template de verificación
const EMAILJS_PUBLIC_KEY = "user_1234567890abcdef" // Tu Public Key
\`\`\`

## Paso 6: Configurar Google Forms

1. Crea un Google Forms para la asistencia
2. Agrega estos campos:
   - Nombre completo (texto corto)
   - Email (texto corto)
   - Código de verificación (texto corto) ← **IMPORTANTE**
   - Clase (texto corto)
3. Copia la URL del formulario (ejemplo: https://forms.gle/abc123)
4. Usa esta URL cuando generes el QR en la aplicación

## Flujo completo del sistema

1. **Registro de usuario:**
   - Usuario completa el formulario de registro
   - Se guarda en localStorage
   - Se envía email de confirmación automáticamente

2. **Generación de QR:**
   - Profesor selecciona una clase
   - Ingresa su email y la URL del Google Forms
   - Se genera un código de 4 dígitos aleatorio
   - Se envía el código por email al profesor
   - Se genera el QR con el link directo al Google Forms

3. **Asistencia:**
   - Alumno escanea el QR
   - Se abre el Google Forms
   - Alumno completa el formulario e ingresa el código que el profesor recibió por email
   - El profesor verifica que el código coincida

## Límites del plan gratuito de EmailJS

- 200 emails por mes
- Suficiente para un MVP o proyecto universitario
- Si necesitas más, puedes actualizar a un plan pago

## Solución de problemas

### Los emails no llegan a Gmail
- Revisa la carpeta de Spam
- Asegúrate de haber verificado tu cuenta de EmailJS
- Verifica que el servicio de email esté correctamente conectado

### Error "Failed to send email"
- Verifica que las credenciales sean correctas
- Asegúrate de tener conexión a internet
- Revisa la consola del navegador para más detalles

### El código no funciona
- Asegúrate de haber ejecutado `npm install` después de agregar @emailjs/browser
- Verifica que los nombres de las variables en los templates coincidan con el código

## Contacto

Si tienes problemas, revisa la documentación oficial de EmailJS:
https://www.emailjs.com/docs/
