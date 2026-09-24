// ============================================
// DATOS POR DEFECTO: Eventos, Fotos, About, Contacto
// Todos editables desde el AdminDashboard
// ============================================

export const defaultEvents = [
  {
    id: 1,
    name: "Otakonce 2024",
    date: "Noviembre 2024",
    image: "/assets/event_2024.webp",
    description: "Nuestra edición más grande hasta la fecha. Más de 3.000 asistentes, 30 stands y la primera pasarela cosplay con premios en efectivo.",
    highlights: ["3.000+ asistentes", "30 stands", "Pasarela Cosplay con premios"]
  },
  {
    id: 2,
    name: "Otakonce 2023",
    date: "Noviembre 2023",
    image: "/assets/event_2023.webp",
    description: "El regreso presencial post-pandemia. Comunidades de todo el Biobío se reunieron para celebrar el anime y la cultura geek.",
    highlights: ["Regreso presencial", "Comunidades del Biobío"]
  },
  {
    id: 3,
    name: "Otakonce 2022",
    date: "Noviembre 2022",
    image: "/assets/event_2022.webp",
    description: "Primera edición en el Gimnasio USM. Torneos de Smash Bros., K-Pop Dance y el debut del Callejón del Artista.",
    highlights: ["Primera edición USM", "Torneos Smash Bros.", "Callejón del Artista"]
  }
];

export const defaultPhotos = [
  { id: 1, src: "/assets/gallery_1.webp", alt: "Cosplay grupal Otakonce 2024", category: "Cosplay" },
  { id: 2, src: "/assets/gallery_2.webp", alt: "Escenario principal", category: "Evento" },
  { id: 3, src: "/assets/gallery_3.webp", alt: "Callejón del Artista", category: "Evento" },
  { id: 4, src: "/assets/gallery_4.webp", alt: "Torneo Smash Bros", category: "Gaming" },
  { id: 5, src: "/assets/gallery_5.webp", alt: "Pasarela Cosplay", category: "Cosplay" },
  { id: 6, src: "/assets/gallery_6.webp", alt: "K-Pop Dance Cover", category: "Comunidad" },
];

export const defaultAboutConfig = {
  title: "¿Qué es Otakonce?",
  subtitle: "El punto de encuentro oficial para los amantes del anime, cosplay y videojuegos en Concepción.",
  heroImage: "/assets/otakonce_about_hero.jpg",
  description: "Otakonce es el mayor evento de anime, videojuegos, cosplay y cultura geek de Concepción y el sur de Chile. Reunimos a miles de fanáticos en jornadas llenas de cosplay, música, torneos, ilustración y comunidad. ¡Entrada liberada para todo público!",
  mission: "Crear un espacio gratuito e inclusivo donde la comunidad otaku y geek del sur de Chile pueda expresarse, conectar y celebrar su pasión.",
  highlights: [
    { icon: "Star", title: "Invitados Especiales", text: "Cosplayers y jurados de todo Chile" },
    { icon: "Camera", title: "Pasarela Cosplay", text: "Competencia con premios en efectivo" },
    { icon: "Users", title: "Comunidades", text: "Stands, talleres y agrupaciones locales" },
    { icon: "Calendar", title: "Actividades", text: "Torneos, K-Pop Dance, trivias y más" }
  ],
  showPhotos: true,
  photos: [
    { id: 1, url: "/assets/gallery_1.webp", caption: "El fervor de la comunidad Otakonce" },
    { id: 2, url: "/assets/gallery_2.webp", caption: "Escenario principal y actividades en vivo" },
    { id: 3, url: "/assets/gallery_3.webp", caption: "Stands, artistas e ilustradores del Biobío" }
  ],
  showStaff: false,
  staff: [
    { id: 1, name: "Cristóbal Sandoval", role: "Organización General", image: "", instagram: "https://www.instagram.com/laotakonce/" },
    { id: 2, name: "Equipo de Producción", role: "Coordinación & Logística", image: "", instagram: "" },
    { id: 3, name: "Comité Cosplay", role: "Pasarela y Jurados", image: "", instagram: "" }
  ]
};

export const defaultContactConfig = {
  email: "contacto@otakonce.cl",
  instagram: "https://www.instagram.com/laotakonce/",
  tiktok: "",
  twitter: "",
  location: "Gimnasio USM Sede Concepción",
  locationDetail: "Av. España 1680, Concepción, Chile",
  formEnabled: false
};
