export const defaultEventConfig = {
  title: "Otakonce 2026",
  subtitle: "El evento de anime, videojuegos y cultura geek más grande de Concepción",
  date: "14 y 15 de Noviembre, 2026",
  location: "Gimnasio USM Sede Concepción",
  countdownDate: "2026-11-14T11:00:00",
  bannerImage: "/assets/hero_banner.webp",
};

export const defaultBanners = [
  {
    id: 1,
    title: "Otakonce 2026",
    subtitle: "El evento de anime, videojuegos y cultura geek más grande de Concepción",
    image: "/assets/hero_banner.webp",
    badge: "EVENTO OFICIAL",
    alignmentX: "left",
    titleColor: "#FFFFFF",
    subtitleColor: "#FFFFFF",
    badgeBgColor: "#FF3B6C",
    linkUrl: "#schedule",
    linkLabel: "Ver Cronograma"
  },
  {
    id: 2,
    title: "¡Inscripciones Cosplay Abiertas!",
    subtitle: "Sé parte de la pasarela cosplay más grande del sur de Chile. Premios en efectivo.",
    image: "/assets/banner_cosplay.webp",
    badge: "CONCURSOS",
    alignmentX: "center",
    titleColor: "#FFFFFF",
    subtitleColor: "#FFFFFF",
    badgeBgColor: "#FF3B6C",
    linkUrl: "#cosplay",
    linkLabel: "Inscribirse Aquí"
  },
  {
    id: 3,
    title: "Zona de Comunidades y Freeplay",
    subtitle: "Torneos de videojuegos, TCG, stands y comida asiática en un solo lugar.",
    image: "/assets/banner_gaming.webp",
    badge: "GAMING & TCG",
    alignmentX: "right",
    titleColor: "#FFFFFF",
    subtitleColor: "#FFFFFF",
    badgeBgColor: "#FFE200",
    linkUrl: "#communities",
    linkLabel: "Ver Comunidades"
  }
];

export const defaultFloatingBanner = {
  text: "🚨 ¡Inscripciones abiertas para la Pasarela Cosplay y Torneos TCG! Cierre: 30 de Octubre.",
  link: "#cosplay",
  active: true,
};

export const defaultNews = [
  {
    id: 1,
    title: "¡Mokomaru confirmada como animadora oficial de Otakonce 2026!",
    summary: "Nuestra querida cosplayer y streamer penquista liderará la conducción de esta nueva edición aniversario.",
    content: "¡Es oficial! Nos complace anunciar que Mokomaru volverá a subir al escenario principal como nuestra animadora oficial. Con su gran trayectoria en la escena geek del Biobío y su carisma inigualable, nos asegura dos jornadas llenas de energía, trivias y mucha interacción. Prepárense para participar en las dinámicas que tiene preparadas para ustedes en el escenario principal.",
    category: "Anuncio",
    date: "Julio 5, 2026",
    image: "/assets/news_mokomaru.jpg",
    readTime: "2 min"
  },
  {
    id: 2,
    title: "Bases Oficiales para el Concurso de Cosplay Pasarela y Grupal",
    summary: "Ya están disponibles las bases para inscribirse. Este año contamos con premios en efectivo de hasta $500.000 CLP.",
    content: "¡Atención cosplayers! Ya se encuentran publicadas las bases oficiales para nuestras dos categorías estrella: Pasarela Individual e Impacto Grupal. Este año el jurado evaluará confección, caracterización y desempeño escénico. Contamos con una bolsa de premios históricos gracias a nuestros auspiciadores. Las inscripciones estarán abiertas hasta completar los 40 cupos reglamentarios.",
    category: "Cosplay",
    date: "Junio 28, 2026",
    image: "/assets/news_cosplay_bases.jpg",
    readTime: "4 min"
  },
  {
    id: 3,
    title: "Alianza con Comunidades: Zona de Videojuegos y Freeplay",
    summary: "El bloque gamer crece con más consolas, torneos retro y una sección dedicada a desarrolladores locales de videojuegos.",
    content: "En colaboración con agrupaciones de gaming locales, esta edición de Otakonce contará con una Zona Freeplay expandida. Tendremos torneos de Super Smash Bros. Ultimate, Mortal Kombat 1 y un sector especial de Just Dance 2026. Además, abrimos un espacio exclusivo para que desarrolladores independientes chilenos muestren sus proyectos de videojuegos a toda la comunidad.",
    category: "Comunidad",
    date: "Junio 15, 2026",
    image: "/assets/news_gaming_zone.jpg",
    readTime: "3 min"
  },
  {
    id: 4,
    title: "Regresan las Ilustradoras locales en el Callejón del Artista",
    summary: "Más de 50 artistas e ilustradores del sur de Chile se darán cita para mostrar sus mejores obras y merchandising.",
    content: "El Callejón del Artista es el corazón creativo de Otakonce. Este año hemos duplicado el espacio para albergar a ilustradores de Concepción, Temuco, Chillán y Valdivia. Podrán encontrar stickers, pósters, llaveros, fanarts y arte original exclusivo de sus animes, videojuegos y series favoritas. ¡Apoyemos el talento local de nuestra región!",
    category: "Anuncio",
    date: "Mayo 30, 2026",
    image: "/assets/news_artist_alley.jpg",
    readTime: "3 min"
  }
];

export const defaultCosplayers = [
  {
    id: 1,
    name: "Aki Cosplay",
    character: "Frieren (Sousou no Frieren)",
    instagram: "https://instagram.com/aki_cosplay_demo",
    image: "/assets/cosplay_aki.jpg",
    bio: "Cosplayer penquista con 5 años de trayectoria. Especialista en confección de trajes de fantasía y estilizado de pelucas detalladas."
  },
  {
    id: 2,
    name: "Kaelu Cos",
    character: "Roronoa Zoro (One Piece)",
    instagram: "https://instagram.com/kaelu_zoro_demo",
    image: "/assets/cosplay_kaelu.jpg",
    bio: "Cosmaker y exponente del cosplay masculino en Concepción. Apasionado por la réplica de armas y armaduras con goma EVA de alta densidad."
  },
  {
    id: 3,
    name: "Nico Kitsune",
    character: "Marin Kitagawa (My Dress-Up Darling)",
    instagram: "https://instagram.com/nico_kitsune_demo",
    image: "/assets/cosplay_nico.jpg",
    bio: "Creadora de contenido y cosplayer. Le encanta el anime de romance, el modelaje alternativo y las pasarelas dinámicas con puesta en escena divertida."
  }
];

export const defaultCommunities = [
  {
    id: 1,
    name: "Conce K-Pop Dance",
    type: "Danza & Performance",
    description: "Agrupación que fomenta el baile K-pop en la Región del Biobío. Organizan random dance, talleres gratuitos en el parque y el bloque estelar de baile de Otakonce.",
    logo: "/assets/comm_kpop.jpg",
    instagram: "https://instagram.com/concekpop_demo"
  },
  {
    id: 2,
    name: "TCG Biobío Vanguard & Magic",
    type: "Juegos de Cartas Coleccionables",
    description: "Comunidad dedicada a la difusión y juego competitivo de TCGs como Magic, Yu-Gi-Oh! y Cardfight!! Vanguard. Organizarán torneos de demostración y freeplay.",
    logo: "/assets/comm_tcg.jpg",
    instagram: "https://instagram.com/tcgbiobio_demo"
  },
  {
    id: 3,
    name: "Smash Concepción Club",
    type: "Videojuegos Competitivos",
    description: "El club oficial de Super Smash Bros. en Concepción. Realizan torneos mensuales, ránkings regionales (PR) y coordinan el gran torneo anual dentro de Otakonce.",
    logo: "/assets/comm_smash.jpg",
    instagram: "https://instagram.com/smashconcep_demo"
  }
];

export const defaultSchedule = [
  {
    id: 1,
    time: "11:00",
    title: "Apertura de Puertas & Acreditación",
    stage: "Escenario Principal",
    description: "Apertura de accesos para público general, inicio del Callejón del Artista y stands de venta."
  },
  {
    id: 2,
    time: "12:00",
    title: "Inauguración & Trivia Anime Express",
    stage: "Escenario Principal",
    description: "Bienvenida oficial con la animación de Mokomaru y premios instantáneos para los primeros asistentes."
  },
  {
    id: 3,
    time: "13:30",
    title: "Bloque K-Pop Dance Cover",
    stage: "Escenario Principal",
    description: "Presentación en vivo de las agrupaciones de Conce K-Pop Dance con las coreografías más populares del momento."
  },
  {
    id: 4,
    time: "15:00",
    title: "Charla: Costura y Prop-making en Concepción",
    stage: "Sala de Conferencias",
    description: "Mesa redonda con Aki Cosplay y Kaelu Cos sobre cómo iniciarse en el cosplay de forma económica."
  },
  {
    id: 5,
    time: "16:30",
    title: "Gran Concurso Pasarela Cosplay",
    stage: "Escenario Principal",
    description: "La competencia estelar individual de cosplay. Pasarela, actuación y evaluación del jurado experto."
  },
  {
    id: 6,
    time: "18:00",
    title: "Show Musical: Banda Anime Rock",
    stage: "Escenario Principal",
    description: "Música en vivo con covers de los openings de Shingeki no Kyojin, Dragon Ball y Naruto."
  },
  {
    id: 7,
    time: "19:00",
    title: "Premiación & Ceremonia de Clausura",
    stage: "Escenario Principal",
    description: "Entrega de premios de torneos Smash, cosplay individual y palabras de cierre del staff de Otakonce."
  }
];
