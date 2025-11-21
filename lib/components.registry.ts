import { ComponentType, ComponentProps } from '@/types/page';
import { z } from 'zod';

export interface ComponentSchema {
  type: ComponentType;
  name: string;
  description: string;
  icon: string;
  defaultProps: ComponentProps;
  propsSchema: z.ZodObject<any>;
  canHaveChildren: boolean;
  allowedChildren?: ComponentType[];
}

export const heroPropsSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  subtitle: z.string().optional(),
  backgroundImage: z.string().url().optional().or(z.literal('')),
  ctaText: z.string().optional(),
  ctaLink: z.string().url().optional().or(z.literal('')),
});

export const articleCardPropsSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  excerpt: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  author: z.string().optional(),
  publishedAt: z.string().optional(),
  category: z.string().optional(),
  link: z.string().url().optional().or(z.literal('')),
});

export const articleListPropsSchema = z.object({
  title: z.string().optional(),
  columns: z.enum(['1', '2', '3', '4']).default('3'),
});

export const sectionPropsSchema = z.object({
  backgroundColor: z.string().optional(),
  padding: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('md'),
});

export const textPropsSchema = z.object({
  content: z.string().min(1, 'El contenido es requerido'),
  variant: z.enum(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']).default('p'),
  align: z.enum(['left', 'center', 'right']).default('left'),
});

export const imagePropsSchema = z.object({
  src: z.string().url('Debe ser una URL válida'),
  alt: z.string().min(1, 'El texto alternativo es requerido'),
  width: z.number().optional(),
  height: z.number().optional(),
  objectFit: z.enum(['contain', 'cover', 'fill', 'none', 'scale-down']).default('cover'),
});

export const containerPropsSchema = z.object({
  maxWidth: z.enum(['sm', 'md', 'lg', 'xl', '2xl', 'full']).default('xl'),
  padding: z.boolean().default(true),
});

export const componentSchemas: ComponentSchema[] = [
  {
    type: 'Component',
    name: 'Componente',
    description: 'Bloque genérico para construir la página',
    icon: '🧩',
    defaultProps: {},
    propsSchema: z.object({}),
    canHaveChildren: true,
  },
  {
    type: 'Hero',
    name: 'Hero',
    description: 'Sección principal con título, subtítulo y CTA',
    icon: '🎯',
    defaultProps: {
      title: 'Título del Hero',
      subtitle: '',
      backgroundImage: '',
      ctaText: '',
      ctaLink: '',
    },
    propsSchema: heroPropsSchema,
    canHaveChildren: false,
  },
  {
    type: 'ArticleCard',
    name: 'Tarjeta de Artículo',
    description: 'Tarjeta individual de artículo',
    icon: '📄',
    defaultProps: {
      title: 'Título del Artículo',
      excerpt: '',
      image: '',
      author: '',
      publishedAt: '',
      category: '',
      link: '',
    },
    propsSchema: articleCardPropsSchema,
    canHaveChildren: false,
  },
  {
    type: 'ArticleList',
    name: 'Lista de Artículos',
    description: 'Lista de artículos en grid',
    icon: '📋',
    defaultProps: {
      title: '',
      columns: '3',
    },
    propsSchema: articleListPropsSchema,
    canHaveChildren: true,
    allowedChildren: ['ArticleCard'],
  },
  {
    type: 'Section',
    name: 'Sección',
    description: 'Contenedor de sección con fondo y padding',
    icon: '📦',
    defaultProps: {
      backgroundColor: '',
      padding: 'md',
    },
    propsSchema: sectionPropsSchema,
    canHaveChildren: true,
  },
  {
    type: 'Text',
    name: 'Texto',
    description: 'Bloque de texto con diferentes variantes',
    icon: '📝',
    defaultProps: {
      content: 'Texto aquí',
      variant: 'p',
      align: 'left',
    },
    propsSchema: textPropsSchema,
    canHaveChildren: false,
  },
  {
    type: 'Image',
    name: 'Imagen',
    description: 'Imagen con configuración de tamaño',
    icon: '🖼️',
    defaultProps: {
      src: '',
      alt: 'Imagen',
      width: undefined,
      height: undefined,
      objectFit: 'cover',
    },
    propsSchema: imagePropsSchema,
    canHaveChildren: false,
  },
  {
    type: 'Container',
    name: 'Contenedor',
    description: 'Contenedor con ancho máximo y padding',
    icon: '📦',
    defaultProps: {
      maxWidth: 'xl',
      padding: true,
    },
    propsSchema: containerPropsSchema,
    canHaveChildren: true,
  },
];

export function getComponentSchema(type: ComponentType): ComponentSchema | undefined {
  return componentSchemas.find((schema) => schema.type === type);
}

