/**
 * Configuración centralizada del sistema
 * Todas las variables de entorno se cargan y validan aquí
 */

// ============================================
// API Configuration
// ============================================
export const API_CONFIG = {
  // URL de la API backend
  // Si está vacío, usa las rutas de API de Next.js (/api)
  url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api',
} as const;

// ============================================
// Storage Configuration
// ============================================
export const STORAGE_CONFIG = {
  // Directorio donde se almacenan los archivos de datos
  dataDir: process.env.DATA_DIR || 'data',
  // Nombre del archivo donde se almacenan las páginas
  pagesFileName: process.env.PAGES_FILE_NAME || 'pages.json',
  // Nombre del archivo donde se almacenan los componentes del registry
  componentsFileName: process.env.COMPONENTS_FILE_NAME || 'components.json',
} as const;

// ============================================
// Application Configuration
// ============================================
export const APP_CONFIG = {
  // URL base de la aplicación
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  // Entorno de ejecución
  env: process.env.NODE_ENV || 'development',
  // Es desarrollo
  isDevelopment: process.env.NODE_ENV === 'development',
  // Es producción
  isProduction: process.env.NODE_ENV === 'production',
} as const;

// ============================================
// Security Configuration (Para uso futuro)
// ============================================
export const SECURITY_CONFIG = {
  // Secret key para firmar tokens JWT
  jwtSecret: process.env.JWT_SECRET || '',
  // Secret key para encriptar datos sensibles
  encryptionKey: process.env.ENCRYPTION_KEY || '',
} as const;

// ============================================
// CORS Configuration
// ============================================
export const CORS_CONFIG = {
  // Orígenes permitidos para CORS
  allowedOrigins: process.env.NEXT_PUBLIC_ALLOWED_ORIGINS
    ? process.env.NEXT_PUBLIC_ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3001', 'http://localhost:3000'],
} as const;

// ============================================
// Logging Configuration
// ============================================
export const LOG_CONFIG = {
  // Nivel de log
  level: (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
} as const;

// ============================================
// Validación de configuración requerida
// ============================================
export function validateConfig() {
  const errors: string[] = [];

  // Validar configuración en producción
  if (APP_CONFIG.isProduction) {
    if (!API_CONFIG.url || API_CONFIG.url === '/api') {
      console.warn('⚠️  En producción, considera usar una URL de API externa');
    }
    
    // Si se requiere autenticación en el futuro, validar JWT_SECRET
    // if (process.env.REQUIRE_AUTH === 'true' && !SECURITY_CONFIG.jwtSecret) {
    //   errors.push('JWT_SECRET no está configurado (requerido para autenticación)');
    // }
  }

  if (errors.length > 0) {
    throw new Error(`Errores de configuración:\n${errors.join('\n')}`);
  }
}

// Validar configuración al cargar el módulo en servidor
if (typeof window === 'undefined') {
  validateConfig();
}

