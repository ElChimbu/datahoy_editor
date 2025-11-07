'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ComponentDefinition } from '@/types/page';
import { getComponentSchema } from '@/lib/components.registry';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

interface ComponentFormProps {
  component: ComponentDefinition;
  onUpdate: (props: any) => void;
}

export const ComponentForm: React.FC<ComponentFormProps> = ({
  component,
  onUpdate,
}) => {
  const schema = getComponentSchema(component.type);
  if (!schema) return null;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema.propsSchema),
    defaultValues: component.props,
  });

  React.useEffect(() => {
    const subscription = watch((value) => {
      onUpdate(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, onUpdate]);

  const renderField = (key: string, value: any) => {
    const fieldError = errors[key]?.message as string | undefined;

    // String fields
    if (typeof value === 'string') {
      // URL fields
      if (key.includes('url') || key.includes('link') || key.includes('src') || key.includes('image')) {
        return (
          <Input
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            type="url"
            {...register(key)}
            error={fieldError}
            className="mb-4"
          />
        );
      }
      // Textarea for longer text
      if (key.includes('content') || key.includes('excerpt') || key.includes('description')) {
        return (
          <Textarea
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            {...register(key)}
            error={fieldError}
            className="mb-4"
            rows={4}
          />
        );
      }
      // Regular text input
      return (
        <Input
          key={key}
          label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
          {...register(key)}
          error={fieldError}
          className="mb-4"
        />
      );
    }

    // Number fields
    if (typeof value === 'number') {
      return (
        <Input
          key={key}
          label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
          type="number"
          {...register(key, { valueAsNumber: true })}
          error={fieldError}
          className="mb-4"
        />
      );
    }

    // Boolean fields
    if (typeof value === 'boolean') {
      return (
        <div key={key} className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register(key)}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            </span>
          </label>
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError}</p>
          )}
        </div>
      );
    }

    // Enum/Select fields (based on common patterns)
    if (
      key === 'columns' ||
      key === 'variant' ||
      key === 'align' ||
      key === 'padding' ||
      key === 'objectFit' ||
      key === 'maxWidth'
    ) {
      const options: { value: string; label: string }[] = [];

      if (key === 'columns') {
        options.push(
          { value: '1', label: '1 columna' },
          { value: '2', label: '2 columnas' },
          { value: '3', label: '3 columnas' },
          { value: '4', label: '4 columnas' }
        );
      } else if (key === 'variant') {
        options.push(
          { value: 'p', label: 'Párrafo' },
          { value: 'h1', label: 'Título 1' },
          { value: 'h2', label: 'Título 2' },
          { value: 'h3', label: 'Título 3' },
          { value: 'h4', label: 'Título 4' },
          { value: 'h5', label: 'Título 5' },
          { value: 'h6', label: 'Título 6' }
        );
      } else if (key === 'align') {
        options.push(
          { value: 'left', label: 'Izquierda' },
          { value: 'center', label: 'Centro' },
          { value: 'right', label: 'Derecha' }
        );
      } else if (key === 'padding') {
        options.push(
          { value: 'none', label: 'Sin padding' },
          { value: 'sm', label: 'Pequeño' },
          { value: 'md', label: 'Mediano' },
          { value: 'lg', label: 'Grande' },
          { value: 'xl', label: 'Extra grande' }
        );
      } else if (key === 'objectFit') {
        options.push(
          { value: 'contain', label: 'Contener' },
          { value: 'cover', label: 'Cubrir' },
          { value: 'fill', label: 'Llenar' },
          { value: 'none', label: 'Ninguno' },
          { value: 'scale-down', label: 'Escalar' }
        );
      } else if (key === 'maxWidth') {
        options.push(
          { value: 'sm', label: 'Pequeño' },
          { value: 'md', label: 'Mediano' },
          { value: 'lg', label: 'Grande' },
          { value: 'xl', label: 'Extra grande' },
          { value: '2xl', label: '2X grande' },
          { value: 'full', label: 'Completo' }
        );
      }

      return (
        <Select
          key={key}
          label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
          options={options}
          {...register(key)}
          error={fieldError}
          className="mb-4"
        />
      );
    }

    // Color picker
    if (key.includes('color') || key.includes('Color')) {
      return (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
          </label>
          <div className="flex gap-2">
            <Input
              type="color"
              {...register(key)}
              className="w-16 h-10"
            />
            <Input
              type="text"
              {...register(key)}
              placeholder="#000000"
              error={fieldError}
              className="flex-1"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <form onSubmit={handleSubmit(() => {})} className="space-y-4">
      {Object.entries(component.props).map(([key, value]) =>
        renderField(key, value)
      )}
    </form>
  );
};

