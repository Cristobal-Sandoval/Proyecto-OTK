# 🌸 Otakonce 2026 — Plataforma Web Oficial

Sitio web oficial y panel de administración interactivo para **Otakonce 2026**, el mayor evento de anime, videojuegos, cosplay y cultura geek de Concepción, Chile.

---

## 🚀 Tecnologías & Arquitectura

- **Frontend**: React 19 + Vite 8
- **Estilos & Diseño**: Pop-Art / Comic Book UI, CSS Variables dinámicas, animaciones aceleradas por hardware
- **Iconografía**: Lucide React
- **Optimización de Assets**:
  - Logotipo oficial 100% vectorizado a SVG (`public/otakonce-logo.svg`)
  - Banners en formato WebP de alta compresión (reducción >75% de peso)
  - Code-splitting con `React.lazy()` y `<Suspense>`
- **Persistencia**: LocalStorage con migración automática y fallback
- **Seguridad**: Autenticación de panel con Web Crypto API (SHA-256)
- **SEO & PWA**: JSON-LD Structured Data, OpenGraph, Twitter Cards, `sitemap.xml`, `robots.txt`, Web App Manifest

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

4. **Compilar para producción**:
   ```bash
   npm run build
   ```

---

## ⚙️ Características Principales

- **Hero Dinámico & Carrusel**: Banners widescreen con máscaras de legibilidad graduadas, alineación configurable por banner (izquierda, centro, derecha) y tipografía con contorno pop-art de alto contraste.
- **Cuenta Regresiva & Barra Inferior**: Cronómetro en tiempo real hacia la fecha del evento adaptado a todas las resoluciones de pantalla y safe-area de dispositivos móviles.
- **Panel de Administración (Staff)**:
  - Oculto del menú público por seguridad.
  - Acceso mediante atajo de teclado: `Ctrl + Shift + A` (o `Cmd + Shift + A` en Mac), o navegando a `#admin`.
  - Edición en tiempo real de: información del evento, carrusel de banners, barra de anuncios flotante, noticias, cosplayers invitados, comunidades y cronograma de actividades.
- **Secciones Públicas**:
  - Noticias y comunicados con filtrado por categoría y buscador.
  - Galería de Cosplayers invitados con bio y enlaces a redes sociales.
  - Zona de Comunidades y tiendas.
  - Cronograma interactivo por bloques de horario.

---

## 📄 Licencia

Este proyecto es privado para la organización de Otakonce.
