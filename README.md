# 🌸 Otakonce 2026 — Plataforma Web Oficial

Sitio web oficial y panel de administración interactivo para **Otakonce 2026**, el mayor evento de anime, videojuegos, cosplay y cultura geek de Concepción y el sur de Chile.

---

## 🚀 Tecnologías & Arquitectura

- **Frontend**: React 19 + Vite 8
- **Estilos & Diseño**: Sistema Pop-Art / Comic Book UI responsivo, variables CSS dinámicas, transiciones aceleradas por hardware
- **Iconografía**: Lucide React
- **Almacenamiento & CDN**: Integración con **Cloudinary CDN** para entrega optimizada de imágenes en formato WebP y fallback local
- **Optimización de Rendimiento**:
  - Code-splitting con `React.lazy()` y `<Suspense>`
  - Optimización de chunks con Rolldown / Vite
  - Soporte de caché inmutable para assets estáticos
- **Seguridad**:
  - Encriptación criptográfica con Web Crypto API (SHA-256)
  - Limitación de tasa de intentos (Rate-limiting anti-fuerza bruta)
  - Cabeceras HTTP de seguridad (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`)
- **SEO & Social Sharing**:
  - Enrutamiento por slugs amigables para noticias (`/#noticia/slug`) y fichas de invitados (`/#invitado/slug`)
  - Botones integrados para compartir en WhatsApp, X (Twitter) y copia de enlace directo
  - Títulos de pestaña dinámicos según la sección o perfil activo
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

1. **Hero & Cronómetro de Cuenta Regresiva**:
   - Banners widescreen de alto impacto visual con diseño pop-art.
   - Contador regresivo hacia el evento con encuadre adaptable para móviles y escritorio.
   - Barra superior de anuncios (fija en escritorio, marquesina continua en móviles).

2. **Invitados Especiales (Cosplay Alley & Jurados)**:
   - **En el Inicio**: Carrusel infinito de desplazamiento suave continuo con flechas flotantes estilo CardPoint y pausa inteligente al interactuar.
   - **En la Sección Dedicada (`#invitados`)**: Grilla responsiva con buscador en tiempo real por nombre, personaje, ciudad o rol.
   - **Página Dedicada por Invitado (`#invitado/slug`)**:
     - Cabecera con imagen destacada, insignias de rol, personaje y ciudad.
     - Reseña y trayectoria del artista.
     - **Mini Galería de Cosplays con Lightbox**: Muestra las presentaciones del invitado con ampliación interactiva a pantalla completa al hacer clic.
     - **Redes Sociales Oficiales**: Enlaces directos a Instagram, TikTok y Twitter/X.
     - **Compartir Real**: Botones directos para compartir en WhatsApp, X o copiar enlace con la URL canónica de la ficha.

3. **Noticias y Anuncios**:
   - Filtros por categoría y barra de búsqueda.
   - Vista individual de noticia (`#noticia/slug`) con formato de lectura optimizado y botones para compartir.

4. **Pasarela Cosplay & Comunidad (Regional & Local)**:
   - Carrusel infinito cinemático con controles flotantes y filtros por ciudad (Concepción, Chillán, Temuco, Santiago, etc.).
   - Fichas interactivas con personajes y enlaces de contacto.

5. **Zonas de Comunidades & Cronograma**:
   - Directorio de agrupaciones, comunidades de videojuegos, TCG y tiendas aliadas.
   - Cronograma interactivo de actividades por bloques horarios y escenarios.

6. **Ambientación Dinámica (Temas de Temporada)**:
   - Soporte de personalización visual con paletas temáticas (Normal, Halloween, Navidad, Teletón, Fiestas Patrias) con animaciones atmosféricas sincronizadas.

### 🛡️ Panel de Gestión Staff (`#stf-portal`)

- **Gestión Integral de Contenidos**:
  - Modos, títulos y fechas del evento.
  - Banners de portada tipo hero con colores, alineación y badges personalizables.
  - Comunicado flotante superior con interruptor de activación.
  - Noticias y anuncios con selector de categoría y fecha.
  - **Cosplayers & Invitados Especiales**: Creación y edición completa de fichas con fotos principales, redes sociales (Instagram, TikTok, Twitter/X) y subida de múltiples fotos para la mini galería lightbox.
  - Comunidades aliadas y cronograma de horarios.
- **Configuración de Almacenamiento**:
  - Vinculación con Cloudinary CDN con test de subida y fallback automático a almacenamiento local.
- **Seguridad & Credenciales**:
  - Módulo para cambio seguro de contraseña de administrador con hash SHA-256.
  - Bloqueo temporal anti-fuerza bruta ante intentos fallidos consecutivos.
  - Enrutamiento stealth protegido contra indexación de motores de búsqueda.

---

## 📄 Licencia

Uso exclusivo para la organización de Otakonce. Todos los derechos reservados.
