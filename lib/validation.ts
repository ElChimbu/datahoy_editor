import { z } from 'zod';
import { ComponentType } from '@/types/page';

export const componentTypeSchema = z.enum([
  'Hero',
  'ArticleCard',
  'ArticleList',
  'Section',
  'Text',
  'Image',
  'Container',
]);

export const componentPropsSchema = z.record(z.any());

export const componentDefinitionSchema = z.object({
  type: componentTypeSchema,
  id: z.string(),
  props: componentPropsSchema,
  children: z.array(z.lazy(() => componentDefinitionSchema)).optional(),
});

export const pageMetadataSchema = z.object({
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  ogImage: z.string().url().optional().or(z.literal('')),
});

// Schema para el formulario que acepta keywords como string y lo transforma a array
export const pageMetadataFormSchema = z.object({
  description: z.string().optional(),
  keywords: z.preprocess(
    (val) => {
      if (!val || val === '') return undefined;
      // Si es un string, intenta parsearlo como JSON primero
      if (typeof val === 'string') {
        // Intenta parsear como JSON array (ej: ["hola", "chau"])
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            return parsed.map((k: any) => String(k).trim()).filter((k: string) => k.length > 0);
          }
        } catch {
          // Si no es JSON válido, trata como string separado por comas
        }
        // Trata como string separado por comas (ej: "hola, chau")
        const keywordsArray = val.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0);
        return keywordsArray.length > 0 ? keywordsArray : undefined;
      }
      // Si ya es un array, devuélvelo tal cual
      if (Array.isArray(val)) {
        return val.map((k: any) => String(k).trim()).filter((k: string) => k.length > 0);
      }
      return undefined;
    },
    z.array(z.string()).optional()
  ),
  ogImage: z.string().url().optional().or(z.literal('')),
});

export const pageDefinitionSchema = z.object({
  id: z.string(),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug debe contener solo letras minúsculas, números y guiones'),
  title: z.string().min(1, 'El título es requerido'),
  metadata: pageMetadataSchema.optional(),
  // Permitir arrays vacíos - los componentes se pueden agregar después en el editor
  components: z.array(componentDefinitionSchema).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const createPageSchema = pageDefinitionSchema.omit({ id: true, createdAt: true, updatedAt: true });

// Schema de formulario que acepta keywords como string
// Permite crear páginas sin componentes (se agregan después en el editor)
export const createPageFormSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug debe contener solo letras minúsculas, números y guiones'),
  title: z.string().min(1, 'El título es requerido'),
  metadata: pageMetadataFormSchema.optional(),
  components: z.array(componentDefinitionSchema).default([]),
});

export const updatePageSchema = createPageSchema;

