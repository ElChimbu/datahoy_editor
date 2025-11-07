'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ComponentDefinition } from '@/types/page';
import { ComponentItem } from './ComponentItem';
import { usePageEditor } from '@/hooks/usePageEditor';

interface ComponentCanvasProps {
  components: ComponentDefinition[];
  selectedComponentId: string | null;
  onSelect: (id: string | null) => void;
  editor: ReturnType<typeof usePageEditor>;
}

const DroppableCanvas: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setNodeRef } = useDroppable({
    id: 'canvas',
  });

  return (
    <div ref={setNodeRef} className="w-full h-full">
      {children}
    </div>
  );
};

export const ComponentCanvas: React.FC<ComponentCanvasProps> = ({
  components,
  selectedComponentId,
  onSelect,
  editor,
}) => {
  const renderComponent = (component: ComponentDefinition) => (
    <SortableComponentItem
      key={component.id}
      component={component}
      isSelected={selectedComponentId === component.id}
      onSelect={() => onSelect(component.id)}
      onDelete={() => editor.deleteComponent(component.id)}
      onDuplicate={() => editor.duplicateComponent(component.id)}
    />
  );

  return (
    <div className="flex-1 bg-white p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <DroppableCanvas>
          <SortableContext
            items={components.map((c) => `component-${c.id}`)}
            strategy={verticalListSortingStrategy}
          >
            {components.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg mb-2">Canvas vacío</p>
                <p className="text-sm">
                  Arrastra componentes desde la paleta para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {components.map(renderComponent)}
              </div>
            )}
          </SortableContext>
        </DroppableCanvas>
      </div>
    </div>
  );
};

interface SortableComponentItemProps {
  component: ComponentDefinition;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const SortableComponentItem: React.FC<SortableComponentItemProps> = ({
  component,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `component-${component.id}`,
    data: {
      type: 'component' as const,
      componentId: component.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ComponentItem
        component={component}
        isSelected={isSelected}
        onSelect={onSelect}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      />
    </div>
  );
};

