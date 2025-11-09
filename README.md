# DataHoy Editor

Frontend de administración para DataHoy que permite crear y editar páginas arrastrando componentes predefinidos mediante una interfaz visual.

## Stack Tecnológico

- React 18.3
- Next.js 14.2 (App Router)
- TypeScript 5.5
- Tailwind CSS 3.4
- @dnd-kit/core para drag and drop
- React Hook Form para formularios
- Zod para validación

## Instalación

```bash
npm install
```

## Configuración

### Variables de Entorno

Copia `.env.example` a `.env.local` y configura las variables necesarias:

```bash
cp .env.example .env.local
```

Edita `.env.local` y ajusta las variables según tu entorno:

#### Variables Principales

- **NEXT_PUBLIC_API_URL**: URL de la API backend (por defecto: `/api` para usar rutas de Next.js)
- **DATA_DIR**: Directorio donde se almacenan los datos (por defecto: `data`)
- **PAGES_FILE_NAME**: Nombre del archivo de páginas (por defecto: `pages.json`)
- **NEXT_PUBLIC_APP_URL**: URL base de la aplicación (por defecto: `http://localhost:3000`)
- **NODE_ENV**: Entorno de ejecución (`development`, `production`, `test`)

#### Ejemplo de configuración para desarrollo local:

```env
NEXT_PUBLIC_API_URL=/api
DATA_DIR=data
PAGES_FILE_NAME=pages.json
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

#### Ejemplo de configuración para producción con backend externo:

```env
NEXT_PUBLIC_API_URL=https://api.datahoy.com/api
DATA_DIR=/var/data/datahoy
PAGES_FILE_NAME=pages.json
NEXT_PUBLIC_APP_URL=https://editor.datahoy.com
NODE_ENV=production
```

> **Nota**: El archivo `.env.local` no se sube a git por seguridad. Asegúrate de configurar las variables de entorno en tu plataforma de despliegue (Vercel, Netlify, etc.).

Para más información sobre todas las variables disponibles, consulta [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md).

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

- `app/` - Rutas y páginas de Next.js
- `components/` - Componentes React reutilizables
- `lib/` - Utilidades y funciones auxiliares
- `types/` - Definiciones de tipos TypeScript
- `hooks/` - Custom hooks

## Funcionalidades

- Dashboard para listar y gestionar páginas
- Editor visual con drag and drop
- Paleta de componentes
- Inspector de propiedades
- Preview en tiempo real
- Guardado y actualización de páginas

