'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageDefinition } from '@/types/page';
import { createPageSchema } from '@/lib/validation';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

interface PageFormProps {
  page?: PageDefinition;
  onSubmit: (data: Omit<PageDefinition, 'id' | 'createdAt' | 'updatedAt'>) => void;
  isLoading?: boolean;
}

export const PageForm: React.FC<PageFormProps> = ({
  page,
  onSubmit,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPageSchema),
    defaultValues: page
      ? {
          title: page.title,
          slug: page.slug,
          metadata: {
            ...page.metadata,
            keywords: page.metadata?.keywords?.join(', ') || '',
          },
          components: page.components,
        }
      : {
          title: '',
          slug: '',
          metadata: {
            keywords: '',
          },
          components: [],
        },
  });

  const title = watch('title');

  // Auto-generate slug from title
  useEffect(() => {
    if (!page && title) {
      const slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', slug);
    }
  }, [title, page, setValue]);

  const handleFormSubmit = (data: any) => {
    // Convert keywords string to array
    const keywordsString = data.metadata?.keywords || '';
    const keywords = keywordsString
      ? keywordsString.split(',').map((k: string) => k.trim()).filter((k: string) => k)
      : undefined;

    onSubmit({
      ...data,
      metadata: {
        ...data.metadata,
        keywords,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Título"
        {...register('title')}
        error={errors.title?.message as string | undefined}
        disabled={isLoading}
      />

      <Input
        label="Slug"
        {...register('slug')}
        error={errors.slug?.message as string | undefined}
        disabled={isLoading}
        helpText="URL amigable para la página (se genera automáticamente desde el título)"
      />

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">Metadata</h3>

        <Textarea
          label="Descripción"
          {...register('metadata.description')}
          error={errors.metadata?.description?.message as string | undefined}
          disabled={isLoading}
          rows={3}
          className="mb-4"
        />

        <Input
          label="Palabras clave (separadas por comas)"
          {...register('metadata.keywords' as any)}
          error={errors.metadata?.keywords?.message as string | undefined}
          disabled={isLoading}
          className="mb-4"
          placeholder="noticias, tecnología, actualidad"
        />

        <Input
          label="Imagen OG"
          type="url"
          {...register('metadata.ogImage')}
          error={errors.metadata?.ogImage?.message as string | undefined}
          disabled={isLoading}
          placeholder="https://ejemplo.com/imagen.jpg"
        />
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {page ? 'Actualizar' : 'Crear'} Página
        </Button>
      </div>
    </form>
  );
};

