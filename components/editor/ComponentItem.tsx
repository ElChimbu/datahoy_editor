'use client';

import React, { useState } from 'react';
import { ComponentDefinition } from '@/types/page';
import { getComponentSchema } from '@/lib/components.registry';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

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
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
    <div
      className={cn(
        'relative mb-2 border-2 rounded-lg p-3 cursor-move bg-white dark:bg-gray-800',
        isSelected && 'border-primary ring-2 ring-primary dark:border-primary',
        !isSelected && 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
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
            <div className="font-semibold text-sm dark:text-gray-100">{schema?.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
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
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded cursor-pointer dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
          >
            Duplicar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirm(true);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded cursor-pointer dark:bg-red-800/40 dark:hover:bg-red-800/60 dark:text-red-300"
          >
            Eliminar
          </button>
        </div>
      </div>
      {component.children && component.children.length > 0 && (
        <div className="mt-2 ml-4 border-l-2 border-gray-200 pl-2 dark:border-gray-700">
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
    <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Eliminar componente" size="sm">
      <p className="text-sm text-gray-700 mb-4">¿Estás seguro de que quieres eliminar este componente?</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={() => setShowConfirm(false)}>Cancelar</Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            setShowConfirm(false);
            onDelete();
          }}
        >
          Eliminar
        </Button>
      </div>
    </Modal>
    </>
  );
};

