# 🌸 Otakonce 2026 — Plataforma Web Oficial

Sitio web oficial de **Otakonce 2026**, el evento de anime, videojuegos, cosplay y cultura geek de Concepción y la Región del Biobío.

## 🚀 Tecnologías

- **Frontend**: React 19 + Vite 8
- **Estilos**: CSS con variables dinámicas y diseño responsivo
- **Iconografía**: Lucide React
- **Imágenes**: Cloudinary CDN con respaldo local
- **Despliegue**: Vercel

## 🛠️ Desarrollo local

Prerrequisitos: Node.js 18+ y npm 9+.

```bash
# Clonar el repositorio
git clone https://github.com/Cristobal-Sandoval/Proyecto-OTK.git
cd Proyecto-OTK

# Variables de entorno (ver nombres disponibles en .env.example)
cp .env.example .env.local

# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173/`.

```bash
# Validar código
npm run lint

# Compilar para producción
npm run build

# Previsualizar la compilación
npm run preview
```

> **Nota**: Nunca subas archivos `.env` o `.env.local` con valores reales al repositorio.

## 📄 Licencia

Uso exclusivo para la organización de Otakonce. Todos los derechos reservados.
