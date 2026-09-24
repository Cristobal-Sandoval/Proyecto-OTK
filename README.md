# 🌸 Otakonce 2026 — Plataforma Web Oficial

Sitio web oficial y panel de administración interactivo para **Otakonce 2026**, el mayor evento de anime, videojuegos, cosplay y cultura geek de Concepción y la Región del Biobío.

---

## 🚀 Tecnologías & Arquitectura

- **Frontend**: React 19 + Vite 8
- **Estilos & Diseño**: Sistema Pop-Art / Comic Book UI responsivo, variables CSS dinámicas, transiciones fluidas aceleradas por hardware
- **Iconografía**: Lucide React
- **Almacenamiento & CDN**: Soporte de subida y optimización con **Cloudinary CDN** y fallback a almacenamiento local persistente
- **Base de Datos & Tiempo Real (Opcional)**: Integración con **Supabase** para sincronización en tiempo real de temas, postulaciones y catálogo
- **Optimización de Rendimiento**:
  - Code-splitting modular con `React.lazy()` y `<Suspense>`
  - Optimización de empaquetado por chunks
  - Portales de React para modales (`createPortal`) evitando conflictos de apilamiento y scroll
  - Prevención de clics fantasma (*ghost-click guard*) en interacción móvil y táctil
- **Seguridad**:
  - Autenticación administrativa server-side con hash scrypt y sesión firmada HMAC en cookie `httpOnly`
  - Sanitización estricta de entradas y contenidos (anti-XSS)
  - Limitación de tasa de intentos (Rate-limiting anti-fuerza bruta)
  - Cabeceras HTTP de seguridad (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`)
- **SEO & Social Sharing**:
  - Enrutamiento SPA por hash y slugs amigables (`/#noticia/slug`, `/#invitado/slug`, `/#cosplay`, `/#past-events`, etc.)
  - Integración con Web Share API nativa y portapapeles para compartir fichas y eventos en redes sociales
  - Structured Data JSON-LD, OpenGraph, `sitemap.xml` y `robots.txt`
- **Despliegue**: Optimizado para **Vercel** con Serverless Functions (`api/`) y reglas de reescritura SPA (`vercel.json`)

---

## 🛠️ Instalación y Ejecución Local

### Prerrequisitos
- Node.js 18+ (recomendado 20+)
- npm 9+

### 1. Clonar el repositorio
```bash
git clone https://github.com/Cristobal-Sandoval/Proyecto-OTK.git
cd Proyecto-OTK
```

### 2. Configurar variables de entorno
Crea tu archivo local a partir del ejemplo:
```bash
cp .env.example .env.local
```
> **Nota de Seguridad**: Nunca subas archivos `.env` o `.env.local` con credenciales reales al repositorio. El archivo `.gitignore` ya está configurado para protegerlos. Consulta `.env.example` para conocer los nombres de variables disponibles.

### 3. Instalar dependencias
```bash
npm install
```

### 4. Iniciar servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173/`.

### 5. Verificaciones de código y compilación
```bash
# Validar sintaxis y reglas de código
npm run lint

# Compilar para producción
npm run build

# Previsualizar la compilación de producción
npm run preview
```

---

## ⚙️ Módulos y Funcionalidades

### 🌟 Experiencia del Usuario (Frontend)

1. **Hero & Cuenta Regresiva**:
   - Portada widescreen con estética manga/pop-art y contador regresivo dinámico hacia el evento.
   - Barra superior de anuncios destacados con marquesina continua adaptable a pantallas móviles.

2. **Invitados Especiales (Cosplay Alley & Jurados)**:
   - Carrusel continuo en portada y catálogo completo en `#invitados` con buscador en tiempo real.
   - Fichas individuales con biografía, redes sociales (Instagram, TikTok, Twitter/X) y mini galería lightbox con ampliación interactiva.

3. **Pasarela Cosplay & Exponentes Regionales**:
   - **En Portada (`/`)**: Carrusel visual continuo de cosplayers con movimiento infinito y acceso directo a la sección completa.
   - **En Sección Dedicada (`#cosplay`)**: Directorio completo en cuadrícula 4x3 paginada (12 exponentes por página), con buscador instantáneo por nombre, personaje o ciudad, y filtro por categorías.
   - **Ficha 2-en-1**: Modal interactivo que presenta la fotografía completa a la izquierda y la información detallada (redes, bio, botón para compartir) a la derecha, adaptándose a 1 columna en móviles.
   - **Postulaciones Abiertas**: Formulario interactivo para que cosplayers de la comunidad puedan inscribirse a la pasarela.

4. **Eventos Pasados & Trayectoria (`#past-events`)**:
   - Vitrina histórica de las ediciones anteriores de Otakonce.
   - Modal interactivo 2-en-1 con póster en alta resolución, hitos del evento, descripción extendida y botones para compartir.

5. **Galería de Fotos & Comunidad (`#galeria`)**:
   - Álbum fotográfico categorizado (Cosplay, Escenario, Torneos, Comunidad) con visor lightbox a pantalla completa y navegación táctil.

6. **¿Qué es Otakonce? (`#sobre-nosotros`)**:
   - Sección informativa con reseña, misión, pilares del evento, fotografías destacadas y equipo organizador.

7. **Noticias & Cronograma**:
   - Centro de novedades con artículos individuales y botones para compartir.
   - Cronograma horario interactivo por escenarios y zonas temáticas.

8. **Contáctanos (`#contacto`)**:
   - Información de ubicación oficial (Gimnasio USM Sede Concepción, Av. España 1680), redes sociales y canales de atención.

9. **Ambientación y Sincronización Global en Tiempo Real**:
   - Paletas temáticas dinámicas (Normal, Halloween, Navidad, Teletón, Fiestas Patrias) que se sincronizan en vivo entre todos los visitantes conectados cuando el staff actualiza el tema.

---

### 🛡️ Panel de Gestión Staff (`#stf-portal`)

El panel de administración permite gestionar el 100% del contenido de la plataforma de manera visual:

- **Próxima Edición**: Configuración de fecha, lugar, horarios y enlaces de entradas.
- **Banners & Marquesina**: Creación y ordenamiento de banners principales con guías de proporción recomendada (1920x800 px).
- **Noticias & Comunicados**: Redacción de anuncios con asignación de categorías y fecha de publicación.
- **Invitados de Honor & Cosplayers**:
  - Subida de fotografías con optimización inteligente.
  - **Fijar al Frente (Pin)**: Capacidad de pinear cosplayers destacados para que aparezcan primero en la cuadrícula y en la portada.
  - Guías visuales de resolución recomendada (ej. 600x800 px relación 3:4).
- **Postulaciones Pasarela & Comunidades**: Bandeja de entrada con previsualización completa y aprobación/descarte en un clic.
- **Eventos Pasados & Galería**: Edición de ediciones históricas, fotos de archivo y categorías.
- **Nosotros & Contacto**: Personalización de textos de presentación, equipo y datos de contacto.
- **Seguridad**:
  - Gestión segura de contraseña administrativa con hashing scrypt.
  - Bloqueo temporal anti-fuerza bruta ante intentos fallidos.
  - Protección de rutas y headers de seguridad en producción.

---

## 📄 Licencia

Uso exclusivo para la organización de Otakonce. Todos los derechos reservados.
