# Configuración de EmailJS para AttendanceHub

Este documento explica cómo configurar EmailJS para habilitar el envío de correos electrónicos en la aplicación.

## Paso 1: Crear cuenta en EmailJS

1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Crea una cuenta gratuita (permite 200 emails/mes)
3. Verifica tu email

## Paso 2: Configurar servicio de email

1. En el dashboard de EmailJS, ve a **Email Services**
2. Haz clic en **Add New Service**
3. Selecciona tu proveedor de email (Gmail, Outlook, etc.)
4. Sigue las instrucciones para conectar tu cuenta
5. Copia el **Service ID** que se genera

## Paso 3: Crear templates de email

### Template 1: Confirmación de Registro

1. Ve a **Email Templates** → **Create New Template**
2. Nombre: "Registration Confirmation"
3. Contenido del template:

\`\`\`
Asunto: Bienvenido a AttendanceHub - Cuenta Creada

Hola {{to_name}},

¡Bienvenido a AttendanceHub! Tu cuenta ha sido creada exitosamente.

Detalles de tu cuenta:
- Usuario: {{username}}
- Fecha de registro: {{registration_date}}

Ya puedes iniciar sesión en la plataforma y comenzar a gestionar tus asistencias.

Saludos,
El equipo de AttendanceHub
\`\`\`

4. Guarda y copia el **Template ID**

### Template 2: Código de Verificación

1. Crea otro template
2. Nombre: "Attendance Verification Code"
3. Contenido del template:

\`\`\`
Asunto: Código de Verificación - AttendanceHub

Hola,

Se ha generado un código QR para la clase: {{class_name}}

Tu código de verificación es: {{verification_code}}

Detalles:
- Fecha: {{date}}
- Hora: {{time}}

Este código es válido por 24 horas.

Saludos,
AttendanceHub
\`\`\`

4. Guarda y copia el **Template ID**

## Paso 4: Obtener Public Key

1. Ve a **Account** → **General**
2. Copia tu **Public Key**

## Paso 5: Configurar en la aplicación

Abre el archivo `src/services/emailService.js` y reemplaza los valores:

\`\`\`javascript
const EMAILJS_SERVICE_ID = 'service_mvpsanti'
const EMAILJS_TEMPLATE_ID_REGISTER = 'template_abcd123'
const EMAILJS_TEMPLATE_ID_VERIFICATION = 'template_wxyz456'
const EMAILJS_PUBLIC_KEY = 'YDG7ef1PGzJup06x6'
\`\`\`

## Funcionalidades implementadas

### 1. Email de confirmación de registro
- Se envía automáticamente cuando un usuario completa el registro
- Incluye nombre, usuario y fecha de registro
- Confirma que la cuenta fue creada exitosamente

### 2. Sistema de verificación con código
- Al generar un QR, se solicita el email del profesor y URL de Google Forms
- Se genera un código de 4 dígitos aleatorio
- Se envía el código por email al profesor
- El QR redirige a una página de verificación
- El profesor debe ingresar el código para confirmar asistencia
- Después de verificar, se redirige al Google Forms

## Flujo de asistencia con verificación

1. Profesor genera QR desde el dashboard
2. Ingresa su email y URL del Google Forms
3. Sistema genera código de 4 dígitos y lo envía por email
4. Profesor escanea el QR (o comparte el link)
5. Se abre página de verificación
6. Profesor ingresa el código recibido por email
7. Sistema valida el código
8. Si es correcto, registra asistencia y redirige al Google Forms

## Notas importantes

- Los códigos de verificación se almacenan en localStorage
- Cada sesión de verificación tiene un ID único
- Los códigos son válidos hasta que se usen o se limpie el localStorage
- EmailJS plan gratuito: 200 emails/mes
- Para producción, considera un plan pago o servicio propio

## Solución de problemas

Si los emails no se envían:
1. Verifica que los IDs y keys sean correctos
2. Revisa la consola del navegador para errores
3. Verifica que tu servicio de email esté conectado en EmailJS
4. Asegúrate de no haber excedido el límite de emails
5. Revisa la carpeta de spam del destinatario
