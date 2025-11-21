'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Save, Undo, Redo, Eye } from 'lucide-react';

interface HeaderProps {
  title?: string;
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onPreview?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onSave,
  onUndo,
  onRedo,
  onPreview,
  canUndo = false,
  canRedo = false,
  isLoading = false,
}) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>}
      </div>
      <div className="flex items-center gap-2">
        {onUndo && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Deshacer (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
        )}
        {onRedo && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Rehacer (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
        )}
        {onPreview && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onPreview}
            title="Ver preview"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        )}
        {onSave && (
          <Button
            variant="primary"
            size="sm"
            onClick={onSave}
            isLoading={isLoading}
            title="Guardar (Ctrl+S)"
          >
            <Save className="h-4 w-4 mr-1" />
            Guardar
          </Button>
        )}
      </div>
    </header>
  );
};

