# Variables de Entorno - DataHoy Editor

Este documento describe todas las variables de entorno disponibles en el sistema y cómo configurarlas.

## Configuración Inicial

1. Copia el archivo `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edita `.env.local` con tus valores específicos.

3. Reinicia el servidor de desarrollo para que los cambios surtan efecto.

## Variables Disponibles

### API Configuration

#### `NEXT_PUBLIC_API_URL`
- **Descripción**: URL de la API backend
- **Valores posibles**:
  - `/api` (por defecto) - Usa las rutas de API de Next.js
  - `http://localhost:3001/api` - Backend externo en desarrollo
  - `https://api.datahoy.com/api` - Backend externo en producción
- **Requerido**: No
- **Ejemplo**: `NEXT_PUBLIC_API_URL=/api`

### Storage Configuration

#### `DATA_DIR`
- **Descripción**: Directorio donde se almacenan los archivos de datos (páginas, etc.)
- **Tipo**: Ruta relativa al directorio raíz del proyecto
- **Por defecto**: `data`
- **Requerido**: No
- **Ejemplo**: `DATA_DIR=data`

#### `PAGES_FILE_NAME`
- **Descripción**: Nombre del archivo donde se almacenan las páginas
- **Tipo**: String
- **Por defecto**: `pages.json`
- **Requerido**: No
- **Ejemplo**: `PAGES_FILE_NAME=pages.json`

### Application Configuration

#### `NEXT_PUBLIC_APP_URL`
- **Descripción**: URL base de la aplicación (para generar URLs absolutas)
- **Tipo**: URL completa
- **Por defecto**: `http://localhost:3000`
- **Requerido**: No
- **Ejemplo**: `NEXT_PUBLIC_APP_URL=http://localhost:3000`

#### `NODE_ENV`
- **Descripción**: Entorno de ejecución
- **Valores posibles**: `development`, `production`, `test`
- **Por defecto**: `development`
- **Requerido**: No
- **Ejemplo**: `NODE_ENV=development`

### Security Configuration (Para uso futuro)

#### `JWT_SECRET`
- **Descripción**: Secret key para firmar tokens JWT (si se implementa autenticación)
- **Tipo**: String (generar con `openssl rand -base64 32`)
- **Requerido**: Solo en producción si se usa autenticación
- **Ejemplo**: `JWT_SECRET=tu_secret_key_aqui`

#### `ENCRYPTION_KEY`
- **Descripción**: Secret key para encriptar datos sensibles
- **Tipo**: String (generar con `openssl rand -base64 32`)
- **Requerido**: Solo si se necesita encriptación
- **Ejemplo**: `ENCRYPTION_KEY=tu_encryption_key_aqui`

### CORS Configuration

#### `NEXT_PUBLIC_ALLOWED_ORIGINS`
- **Descripción**: Orígenes permitidos para CORS (separados por comas)
- **Tipo**: String separado por comas
- **Requerido**: No
- **Ejemplo**: `NEXT_PUBLIC_ALLOWED_ORIGINS=http://localhost:3000,https://datahoy.com`

### Logging Configuration

#### `LOG_LEVEL`
- **Descripción**: Nivel de log
- **Valores posibles**: `debug`, `info`, `warn`, `error`
- **Por defecto**: `info`
- **Requerido**: No
- **Ejemplo**: `LOG_LEVEL=info`

## Configuraciones por Entorno

### Desarrollo Local

```env
NEXT_PUBLIC_API_URL=/api
DATA_DIR=data
PAGES_FILE_NAME=pages.json
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
LOG_LEVEL=debug
```

### Producción con Backend Externo

```env
NEXT_PUBLIC_API_URL=https://api.datahoy.com/api
DATA_DIR=/var/data/datahoy
PAGES_FILE_NAME=pages.json
NEXT_PUBLIC_APP_URL=https://editor.datahoy.com
NODE_ENV=production
LOG_LEVEL=info
JWT_SECRET=tu_jwt_secret_aqui
ENCRYPTION_KEY=tu_encryption_key_aqui
NEXT_PUBLIC_ALLOWED_ORIGINS=https://editor.datahoy.com,https://datahoy.com
```

### Testing

```env
NEXT_PUBLIC_API_URL=/api
DATA_DIR=test-data
PAGES_FILE_NAME=test-pages.json
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=test
LOG_LEVEL=debug
```

## Notas Importantes

1. **Seguridad**: Nunca subas archivos `.env.local` o `.env` al repositorio. Estos archivos están en `.gitignore` por defecto.

2. **Variables Públicas**: Las variables que empiezan con `NEXT_PUBLIC_` son expuestas al cliente y están disponibles en el navegador. No uses estas variables para información sensible.

3. **Variables Privadas**: Las variables sin el prefijo `NEXT_PUBLIC_` solo están disponibles en el servidor (API routes, Server Components, etc.).

4. **Actualización**: Si cambias las variables de entorno, necesitas reiniciar el servidor de desarrollo para que los cambios surtan efecto.

5. **Validación**: El sistema valida automáticamente la configuración al iniciar. Verifica la consola para ver advertencias o errores.

## Uso en el Código

Las variables de entorno se cargan automáticamente a través del archivo `lib/config.ts`. Úsalo así:

```typescript
import { API_CONFIG, STORAGE_CONFIG, APP_CONFIG } from '@/lib/config';

// Usar la configuración
const apiUrl = API_CONFIG.url;
const dataDir = STORAGE_CONFIG.dataDir;
const isDevelopment = APP_CONFIG.isDevelopment;
```

## Despliegue

### Vercel

1. Ve a la configuración del proyecto en Vercel
2. Navega a "Environment Variables"
3. Agrega las variables necesarias para cada entorno (Production, Preview, Development)

### Netlify

1. Ve a la configuración del sitio en Netlify
2. Navega a "Environment variables"
3. Agrega las variables necesarias

### Otros Servicios

Consulta la documentación de tu plataforma de despliegue para saber cómo configurar variables de entorno.

