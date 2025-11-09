// Simulación de entidades de base de datos

export interface Persona {
  id: number;
  nombre: string;
  tipo: "Trabajador" | "Cliente";
  comuna: string;
  email?: string;
  foto?: string;
  descripcion?: string;
}

export interface Servicio {
  id: number;
  titulo: string;
  categoria: string;
  descripcion: string;
  precio: string;
  trabajadorId: number;
  trabajadorNombre?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  icono: string;
  cantidadServicios: number;
}

export interface Certificacion {
  id: number;
  nombre: string;
  entidad: string;
  año: number;
  trabajadorId: number;
}

export interface Curriculum {
  id: number;
  empresa: string;
  cargo: string;
  periodo: string;
  descripcion: string;
  trabajadorId: number;
}

// Datos iniciales
export const personasIniciales: Persona[] = [
  { 
    id: 1, 
    nombre: "María López", 
    tipo: "Trabajador", 
    comuna: "Santiago",
    email: "maria.lopez@email.com",
    foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    descripcion: "Entrenadora personal certificada con 8 años de experiencia. Especializada en fitness funcional y nutrición deportiva."
  },
  { 
    id: 2, 
    nombre: "Pedro Díaz", 
    tipo: "Trabajador", 
    comuna: "Viña del Mar",
    email: "pedro.diaz@email.com",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    descripcion: "Desarrollador Full Stack con experiencia en React, Node.js y bases de datos. Apasionado por crear soluciones web innovadoras."
  },
  { 
    id: 3, 
    nombre: "Ana García", 
    tipo: "Trabajador", 
    comuna: "Providencia",
    email: "ana.garcia@email.com",
    foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    descripcion: "Diseñadora UX/UI con portfolio internacional. Especializada en diseño de aplicaciones móviles y experiencia de usuario."
  },
];

export const serviciosIniciales: Servicio[] = [
  { 
    id: 1, 
    titulo: "Entrenamiento Personal Online", 
    categoria: "Fitness", 
    descripcion: "Sesiones personalizadas de entrenamiento funcional y HIIT. Incluye plan de nutrición básico.",
    precio: "$20.000",
    trabajadorId: 1,
    trabajadorNombre: "María López"
  },
  { 
    id: 2, 
    titulo: "Desarrollo Web Profesional", 
    categoria: "Programación", 
    descripcion: "Creación de sitios web responsivos con React y Tailwind CSS. Optimizados para SEO y rendimiento.",
    precio: "$40.000",
    trabajadorId: 2,
    trabajadorNombre: "Pedro Díaz"
  },
  { 
    id: 3, 
    titulo: "Diseño de Interfaces UX/UI", 
    categoria: "Diseño", 
    descripcion: "Diseño completo de interfaces de usuario para aplicaciones móviles y web. Incluye wireframes y prototipos.",
    precio: "$35.000",
    trabajadorId: 3,
    trabajadorNombre: "Ana García"
  },
  { 
    id: 4, 
    titulo: "Clases de Yoga Online", 
    categoria: "Fitness", 
    descripcion: "Sesiones de yoga para todos los niveles. Mejora tu flexibilidad y reduce el estrés.",
    precio: "$15.000",
    trabajadorId: 1,
    trabajadorNombre: "María López"
  },
];

export const categoriasIniciales: Categoria[] = [
  { id: 1, nombre: "Fitness", icono: "💪", cantidadServicios: 2 },
  { id: 2, nombre: "Programación", icono: "💻", cantidadServicios: 1 },
  { id: 3, nombre: "Diseño", icono: "🎨", cantidadServicios: 1 },
  { id: 4, nombre: "Música", icono: "🎵", cantidadServicios: 0 },
  { id: 5, nombre: "Marketing", icono: "📣", cantidadServicios: 0 },
  { id: 6, nombre: "Fotografía", icono: "📷", cantidadServicios: 0 },
];

export const certificacionesIniciales: Certificacion[] = [
  { id: 1, nombre: "Personal Trainer Certificado", entidad: "NSCA", año: 2020, trabajadorId: 1 },
  { id: 2, nombre: "Nutrición Deportiva", entidad: "ISSN", año: 2021, trabajadorId: 1 },
  { id: 3, nombre: "Full Stack Web Development", entidad: "freeCodeCamp", año: 2022, trabajadorId: 2 },
  { id: 4, nombre: "AWS Certified Developer", entidad: "Amazon", año: 2023, trabajadorId: 2 },
  { id: 5, nombre: "UX Design Professional", entidad: "Google", año: 2022, trabajadorId: 3 },
  { id: 6, nombre: "UI Design Specialization", entidad: "Coursera", año: 2023, trabajadorId: 3 },
];

export const curriculumsIniciales: Curriculum[] = [
  { 
    id: 1, 
    empresa: "FitZone Gym", 
    cargo: "Entrenadora Personal Senior", 
    periodo: "2018 - Presente",
    descripcion: "Atención personalizada a más de 50 clientes. Desarrollo de programas de entrenamiento y planes nutricionales.",
    trabajadorId: 1
  },
  { 
    id: 2, 
    empresa: "TechSolutions SpA", 
    cargo: "Desarrollador Full Stack", 
    periodo: "2021 - Presente",
    descripcion: "Desarrollo de aplicaciones web con React, Node.js y PostgreSQL. Implementación de APIs RESTful.",
    trabajadorId: 2
  },
  { 
    id: 3, 
    empresa: "StartupLab", 
    cargo: "Desarrollador Junior", 
    periodo: "2019 - 2021",
    descripcion: "Desarrollo frontend con JavaScript y CSS. Colaboración en proyectos ágiles.",
    trabajadorId: 2
  },
  { 
    id: 4, 
    empresa: "DesignStudio", 
    cargo: "Diseñadora UX/UI Senior", 
    periodo: "2020 - Presente",
    descripcion: "Diseño de interfaces para aplicaciones móviles y web. Investigación de usuarios y testing.",
    trabajadorId: 3
  },
];

// Funciones para localStorage
export const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const saveToLocalStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Inicializar datos si no existen
export const initializeData = () => {
  if (!localStorage.getItem('personas')) {
    saveToLocalStorage('personas', personasIniciales);
  }
  if (!localStorage.getItem('servicios')) {
    saveToLocalStorage('servicios', serviciosIniciales);
  }
  if (!localStorage.getItem('categorias')) {
    saveToLocalStorage('categorias', categoriasIniciales);
  }
  if (!localStorage.getItem('certificaciones')) {
    saveToLocalStorage('certificaciones', certificacionesIniciales);
  }
  if (!localStorage.getItem('curriculums')) {
    saveToLocalStorage('curriculums', curriculumsIniciales);
  }
};
