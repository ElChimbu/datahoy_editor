'use client';

import React from 'react';
import { ComponentDefinition } from '@/types/page';
import { ComponentForm } from '@/components/forms/ComponentForm';
import { Button } from '@/components/ui/Button';
import { Trash2, Copy } from 'lucide-react';
import { usePageEditor } from '@/hooks/usePageEditor';

interface ComponentInspectorProps {
  component: ComponentDefinition | null;
  editor: ReturnType<typeof usePageEditor>;
}

export const ComponentInspector: React.FC<ComponentInspectorProps> = ({
  component,
  editor,
}) => {
  if (!component) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4">
        <div className="text-center text-gray-400 py-12">
          <p className="text-sm">Ningún componente seleccionado</p>
          <p className="text-xs mt-2">
            Selecciona un componente del canvas para editar sus propiedades
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Propiedades</h3>
        <div className="flex gap-2 mb-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => editor.duplicateComponent(component.id)}
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-1" />
            Duplicar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm('¿Eliminar este componente?')) {
                editor.deleteComponent(component.id);
              }
            }}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar
          </Button>
        </div>
      </div>
      <ComponentForm
        component={component}
        onUpdate={(props) => editor.updateComponent(component.id, props)}
      />
    </div>
  );
};

