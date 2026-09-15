# 🌸 Otakonce 2026 — Plataforma Web Oficial

Sitio web oficial y panel de administración interactivo para **Otakonce 2026**, el mayor evento de anime, videojuegos, cosplay y cultura geek de Concepción y el sur de Chile.

---

## 🚀 Tecnologías & Arquitectura

- **Frontend**: React 19 + Vite 8
- **Estilos & Diseño**: Sistema Pop-Art / Comic Book UI responsivo, variables CSS dinámicas, transiciones aceleradas por hardware
- **Iconografía**: Lucide React
- **Almacenamiento & CDN**: Integración con **Cloudinary CDN** para entrega optimizada de imágenes en formato WebP
- **Optimización de Rendimiento**:
  - Code-splitting con `React.lazy()` y `<Suspense>`
  - Optimización de chunks con Rolldown / Vite
  - Soporte de caché inmutable para assets estáticos
- **Seguridad**:
  - Encriptación criptográfica con Web Crypto API (SHA-256)
  - Limitación de tasa de intentos (Rate-limiting anti-fuerza bruta)
  - Cabeceras HTTP de seguridad (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`)
- **SEO & Social Sharing**:
  - Enrutamiento por slugs amigables para noticias individuales
  - Botones integrados para compartir en WhatsApp, X (Twitter), Facebook y copia de enlace
  - Títulos de pestaña dinámicos según la sección activa
  - Structured Data JSON-LD, OpenGraph, `sitemap.xml` y `robots.txt`
- **Despliegue**: Listo para producción en **Vercel** con reglas de reescritura SPA (`vercel.json`)

---

## 🛠️ Instalación y Ejecución Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/Cristobal-Sandoval/Proyecto-OTK.git
   cd Proyecto-OTK
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173/`.

4. **Verificar sintaxis y calidad de código**:
   ```bash
   npm run lint
   ```

5. **Compilar para producción**:
   ```bash
   npm run build
   ```

---

## ⚙️ Módulos y Funcionalidades

### 🌟 Experiencia Pública
- **Hero & Cronómetro de Cuenta Regresiva**: 
  - Banners widescreen de alto impacto visual con diseño pop-art.
  - Contador regresivo hacia el evento con encuadre adaptable para móviles y escritorio.
- **Barra Superior de Anuncios**:
  - En escritorio: Barra estática, centrada y legible con accesos directos.
  - En móviles: Ticker de marquesina continua que permite leer comunicados extensos sin recortes.
- **Noticias & Artículos Dedicados**:
  - Listado con filtros por categoría y barra de búsqueda.
  - Vista individual de noticia con URL única basada en slug, formato de lectura optimizado y botones para compartir en redes sociales.
- **Pasarela Cosplay**:
  - En escritorio: Cuadrícula simétrica contenida y carrusel guiado por controles de navegación.
  - En móviles: Deslizador táctil (*swipe*) con avance cinemático suave que se detiene al interactuar con el dedo.
- **Zonas de Comunidades & Cronograma**:
  - Directorio de agrupaciones y tiendas aliadas.
  - Cronograma de actividades por bloques horarios y escenarios.
- **Ambientación Dinámica (Temas de Temporada)**:
  - Soporte de personalización visual con paletas temáticas (incluyendo temática patriótica chilena con animaciones tradicionales).

### 🛡️ Panel de Gestión Staff
- **Gestión Integral de Contenidos**:
  - Modos y fechas del evento.
  - Configuración de almacenamiento en la nube (Cloudinary).
  - Banners de portada, noticias, cosplayers invitados, comunidades y cronograma.
- **Seguridad & Credenciales**:
  - Módulo de administración de contraseñas con encriptación segura.
  - Protección de acceso con bloqueo temporal ante intentos fallidos consecutivos.
  - Enrutamiento interno protegido contra indexación de motores de búsqueda.

---

## 📄 Licencia

Uso exclusivo para la organización de Otakonce. Todos los derechos reservados.
