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

Copia `.env.local.example` a `.env.local` y configura la URL de la API:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` y establece:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

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

