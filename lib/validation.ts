import { z } from 'zod';

// Tipo de componente libre (se obtiene del registry o definido por el usuario)
export const componentTypeSchema = z.string().min(1);

export const componentPropsSchema = z.record(z.any());

// Tipado explícito para romper la recursividad en TS
export type ComponentDefinitionInput = {
  type: string;
  id: string;
  props: Record<string, any>;
  children?: ComponentDefinitionInput[];
};

export const componentDefinitionSchema: z.ZodType<ComponentDefinitionInput> = z.lazy(() =>
  z.object({
    type: componentTypeSchema,
    id: z.string(),
    props: componentPropsSchema,
    children: z.array(componentDefinitionSchema).optional(),
  })
);

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

// Construye un esquema Zod dinámico para componentes de tipo libre 'Component'
// Considera subElements y sus claves primitivas más el objeto options
export function buildDynamicComponentSchema(component: ComponentDefinitionInput): z.ZodObject<any> {
  const props: Record<string, any> = component.props || {};
  const shape: Record<string, z.ZodType<any>> = {};

  // Para cada prop simple decidir tipo
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'subElements') return;
    if (value === null || value === undefined) {
      shape[key] = z.any().optional();
    } else if (typeof value === 'string') {
      shape[key] = z.string();
    } else if (typeof value === 'number') {
      shape[key] = z.number();
    } else if (typeof value === 'boolean') {
      shape[key] = z.boolean();
    } else if (typeof value === 'object') {
      shape[key] = z.record(z.any());
    } else {
      shape[key] = z.any();
    }
  });

  // SubElements dinámicos
  if (Array.isArray((props as any).subElements)) {
    const subs: any[] = (props as any).subElements;
    // Recolectar claves extra para forma unificada
    const extraKeys = new Set<string>();
    subs.forEach(se => {
      Object.keys(se).forEach(k => {
        if (!['id','options','subelement_name','href'].includes(k)) extraKeys.add(k);
      });
    });
    const subShapeBase: Record<string, z.ZodType<any>> = {
      subelement_name: z.string().min(1),
      href: z.string().optional(),
      id: z.string().optional(),
      options: z.record(z.any()).optional(),
    };
    extraKeys.forEach(k => {
      // Determinar tipo común
      const types = new Set(subs.map(se => typeof se[k]).filter(t => t !== 'undefined'));
      let schema: z.ZodType<any>;
      if (types.size === 0) schema = z.any().optional();
      else if (types.size > 1) schema = z.any();
      else {
        const t = Array.from(types)[0];
        switch (t) {
          case 'string': schema = z.string(); break;
          case 'number': schema = z.number(); break;
          case 'boolean': schema = z.boolean(); break;
          default: schema = z.any();
        }
      }
      subShapeBase[k] = schema.optional();
    });
    shape['subElements'] = z.array(z.object(subShapeBase));
  }

  return z.object(shape);
}

export function validateDynamicComponent(component: ComponentDefinitionInput) {
  const schema = buildDynamicComponentSchema(component);
  return schema.safeParse(component.props);
}

