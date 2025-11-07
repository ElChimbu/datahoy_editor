'use client';

import React from 'react';
import { ComponentDefinition } from '@/types/page';
import { getComponentSchema } from '@/lib/components.registry';
import { cn } from '@/lib/utils';

interface ComponentItemProps {
  component: ComponentDefinition;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  depth?: number;
}

export const ComponentItem: React.FC<ComponentItemProps> = ({
  component,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  depth = 0,
}) => {
  const schema = getComponentSchema(component.type);

  return (
    <div
      className={cn(
        'relative mb-2 border-2 rounded-lg p-3 cursor-move bg-white',
        isSelected && 'border-primary ring-2 ring-primary',
        !isSelected && 'border-gray-200 hover:border-gray-300'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{schema?.icon}</span>
          <div>
            <div className="font-semibold text-sm">{schema?.name}</div>
            <div className="text-xs text-gray-500">
              {component.type} • ID: {component.id.slice(0, 8)}
            </div>
          </div>
        </div>
        <div className="flex gap-1" onPointerDown={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
          >
            Duplicar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('¿Eliminar este componente?')) {
                onDelete();
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </div>
      {component.children && component.children.length > 0 && (
        <div className="mt-2 ml-4 border-l-2 border-gray-200 pl-2">
          {component.children.map((child) => (
            <ComponentItem
              key={child.id}
              component={child}
              isSelected={false}
              onSelect={onSelect}
              onDelete={() => {}}
              onDuplicate={() => {}}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

