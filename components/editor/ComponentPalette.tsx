'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ComponentType } from '@/types/page';
import { Card } from '@/components/ui/Card';

interface DraggableComponentProps {
  type: ComponentType;
  name: string;
  description: string;
  icon: string;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  type,
  name,
  description,
  icon,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `palette-${type}`,
    data: {
      type: 'palette' as const,
      componentType: type,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cursor-move ${isDragging ? 'opacity-50' : ''}`}
      {...listeners}
      {...attributes}
    >
      <Card hover className="mb-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div className="flex-1">
            <div className="font-semibold text-sm">{name}</div>
            <div className="text-xs text-gray-500 mt-1">{description}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export const ComponentPalette: React.FC = () => {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Componentes
      </h2>
      <div className="space-y-2">
        <DraggableComponent
          key="generic-component"
          // Usamos 'Section' como tipo base genérico para que funcione con el editor actual
          type={"Section" as ComponentType}
          name="Componente"
          description="Bloque genérico para construir la página"
          icon="🧩"
        />
      </div>
    </div>
  );
};

