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

export const pageDefinitionSchema = z.object({
  id: z.string(),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug debe contener solo letras minúsculas, números y guiones'),
  title: z.string().min(1, 'El título es requerido'),
  metadata: pageMetadataSchema.optional(),
  components: z.array(componentDefinitionSchema).min(1, 'Debe tener al menos un componente'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const createPageSchema = pageDefinitionSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const updatePageSchema = createPageSchema;

