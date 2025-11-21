'use client';

import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import { ComponentPalette } from './ComponentPalette';
import { ComponentCanvas } from './ComponentCanvas';
import { ComponentInspector } from './ComponentInspector';
import { ComponentItem } from './ComponentItem';
import { PageForm } from '@/components/forms/PageForm';
import { Header } from '@/components/layout/Header';
import { Modal } from '@/components/ui/Modal';
import { usePageEditor } from '@/hooks/usePageEditor';
import { PageDefinition, ComponentDefinition, ComponentType } from '@/types/page';
import { createPage, updatePage } from '@/lib/api';
import { validateDynamicComponent } from '@/lib/validation';
// Duplicate imports removed (kept the earlier imports)
import { DragData } from '@/hooks/useDragAndDrop';
import { useToast } from '@/components/ui/Toast';
import { getComponentSchema } from '@/lib/components.registry';
import { nanoid } from 'nanoid';

interface PageEditorProps {
  page?: PageDefinition;
  onSave?: (page: PageDefinition) => void;
}

export const PageEditor: React.FC<PageEditorProps> = ({ page, onSave }) => {
  const editor = usePageEditor(page);
  const toast = useToast();
  const [showPageForm, setShowPageForm] = React.useState(!page);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeComponent, setActiveComponent] = useState<ComponentDefinition | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    if (page) {
      editor.updatePage(page);
      editor.setComponents(page.components);
    }
  }, [page]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        editor.undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        editor.redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const activeData = event.active.data.current as DragData;
    
    if (activeData.type === 'component' && activeData.componentId) {
      const component = editor.findComponent(activeData.componentId);
      if (component) {
        setActiveComponent(component);
      }
    } else if (activeData.type === 'palette' && activeData.componentType) {
      const schema = getComponentSchema(activeData.componentType);
      if (schema) {
        setActiveComponent({
          type: activeData.componentType,
          id: 'preview',
          props: { ...schema.defaultProps },
          children: schema.canHaveChildren ? [] : undefined,
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveComponent(null);

    if (!over) return;

    const activeData = active.data.current as DragData;

    // Dropping from palette to canvas
    if (activeData.type === 'palette' && activeData.componentType) {
      const schema = getComponentSchema(activeData.componentType);
      if (!schema) return;
      const newComponent: ComponentDefinition = {
        type: activeData.componentType,
        id: nanoid(),
        props: { ...schema.defaultProps },
        children: schema.canHaveChildren ? [] : undefined,
      };
      if (over.id === 'canvas' || (over.data.current as DragData)?.type === 'component') {
        const next = [...editor.components, newComponent];
        editor.setComponents(next);
        void persistComponents(next, undefined, true);
      }
      return;
    }

    // Reordering components within canvas
    if (activeData.type === 'component' && active.id !== over.id) {
      const overData = over.data.current as DragData;
      
      if (overData && overData.type === 'component' && overData.componentId) {
        const activeIndex = editor.components.findIndex((c) => c.id === activeData.componentId);
        const overIndex = editor.components.findIndex((c) => c.id === overData.componentId);
        
        if (activeIndex !== -1 && overIndex !== -1) {
          const newComponents = [...editor.components];
          const [removed] = newComponents.splice(activeIndex, 1);
          newComponents.splice(overIndex, 0, removed);
          editor.setComponents(newComponents);
          void persistComponents(newComponents, undefined, true);
        }
      } else if (over.id === 'canvas') {
        // Dropped on canvas directly, move to end
        const activeIndex = editor.components.findIndex((c) => c.id === activeData.componentId);
        if (activeIndex !== -1) {
          const newComponents = [...editor.components];
          const [removed] = newComponents.splice(activeIndex, 1);
          newComponents.push(removed);
          editor.setComponents(newComponents);
          void persistComponents(newComponents, undefined, true);
        }
      }
    }
  };

  const handlePageFormSubmit = async (data: Omit<PageDefinition, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      if (editor.page && editor.page.id) {
        // Update existing page
        const result = await updatePage(editor.page.slug, data);
        if (result.success && result.data) {
          editor.updatePage(result.data);
          editor.setComponents(result.data.components);
          setShowPageForm(false);
          if (onSave) {
            onSave(result.data);
          }
        } else {
          setSaveError(result.error || 'Error al actualizar la página');
        }
      } else {
        // Create new page
        const result = await createPage(data);
        if (result.success && result.data) {
          editor.updatePage(result.data);
          editor.setComponents(result.data.components);
          setShowPageForm(false);
          if (onSave) {
            onSave(result.data);
          }
        } else {
          setSaveError(result.error || 'Error al crear la página');
        }
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!editor.page) {
      setShowPageForm(true);
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const pageData = {
        slug: editor.page.slug,
        title: editor.page.title,
        metadata: editor.page.metadata,
        components: editor.components,
      };

      // Validar componentes dinámicos antes de persistir
      for (const comp of pageData.components) {
        if (comp.type === 'Component') {
          const validation = validateDynamicComponent({ type: comp.type, id: comp.id, props: comp.props, children: undefined });
          if (!validation.success) {
            const issues = validation.error.issues.map(i => i.path.join('.') + ': ' + i.message).join('\n');
            const msg = 'Error de validación en componente dinámico:\n' + issues;
            setSaveError(msg);
            toast.error('Errores de validación en componente (ver consola)');
            console.error(msg);
            setIsSaving(false);
            return;
          }
        }
      }

      let result;
      if (editor.page.id) {
        result = await updatePage(editor.page.slug, pageData);
      } else {
        result = await createPage(pageData);
      }

      if (result.success && result.data) {
        editor.updatePage(result.data);
        editor.setComponents(result.data.components);
        setHasUnsavedChanges(false);
        if (onSave) {
          onSave(result.data);
        }
        toast.success('Página guardada exitosamente');
      } else {
        const msg = result.error || 'Error al guardar la página';
        setSaveError(msg);
        toast.error(msg);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      setSaveError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (!editor.page) return;
    const previewUrl = `/${editor.page.slug}`;
    window.open(previewUrl, '_blank');
  };

  // Eliminar componente en memoria (no persiste automáticamente)
  const handleDeleteComponent = async (componentId: string) => {
    // Delete locally using the editor hook and mark document as dirty
    editor.deleteComponent(componentId);
    setHasUnsavedChanges(true);
    toast.info('Componente eliminado localmente. Presiona Guardar para persistir.');
    // We intentionally don't call the backend here; saving happens on user action
  };

  // Duplicar componente y persistir inmediatamente
  const handleDuplicateComponent = async (componentId: string) => {
    const duplicateDeep = (comp: ComponentDefinition): ComponentDefinition => ({
      ...comp,
      id: nanoid(),
      children: comp.children ? comp.children.map(duplicateDeep) : undefined,
    });

    const next = editor.components.flatMap((c) =>
      c.id === componentId ? [c, duplicateDeep(c)] : [c]
    );
    const prev = editor.components;
    editor.setComponents(next);

    if (!editor.page) return;

    setIsSaving(true);
    try {
      await persistComponents(next, 'Componente duplicado', true);
    } catch (e) {
      editor.setComponents(prev);
    } finally {
      setIsSaving(false);
    }
  };

  // Persist helper
  const persistComponents = async (
    nextComponents: ComponentDefinition[],
    successMsg?: string,
    silentSuccess: boolean = false
  ) => {
    if (!editor.page) return;
    const payload = {
      slug: editor.page.slug,
      title: editor.page.title,
      metadata: editor.page.metadata,
      components: nextComponents,
    };
    // Validar dinámicos antes de update parcial
    for (const comp of payload.components) {
      if (comp.type === 'Component') {
        const validation = validateDynamicComponent({ type: comp.type, id: comp.id, props: comp.props, children: undefined });
        if (!validation.success) {
          const issues = validation.error.issues.map(i => i.path.join('.') + ': ' + i.message).join('\n');
          const msg = 'Error de validación en componente dinámico:\n' + issues;
          setSaveError(msg);
          toast.error('Errores de validación en componente (ver consola)');
          console.error(msg);
          return;
        }
      }
    }
    const result = await updatePage(editor.page.slug, payload);
    if (result.success && result.data) {
      editor.updatePage(result.data);
      editor.setComponents(result.data.components);
      setHasUnsavedChanges(false);
      if (!silentSuccess && successMsg) toast.success(successMsg);
      return;
    }
    const msg = result.error || 'Error al guardar cambios';
    setSaveError(msg);
    toast.error(msg);
    throw new Error(msg);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-950">
      <Header
        title={editor.page?.title || 'Nueva Página'}
        onSave={handleSave}
        onUndo={editor.canUndo ? editor.undo : undefined}
        onRedo={editor.canRedo ? editor.redo : undefined}
        onPreview={editor.page ? handlePreview : undefined}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        isLoading={isSaving}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <ResizableEditor
          editor={editor}
          selectedId={editor.selectedComponentId}
          onSelect={editor.setSelectedComponentId}
          onDeleteComponent={handleDeleteComponent}
          onDuplicateComponent={handleDuplicateComponent}
        />
        <DragOverlay zIndex={1000}>
          {activeComponent ? (
            <ComponentItem
              component={activeComponent}
              isSelected={false}
              onSelect={() => {}}
              onDelete={() => {}}
              onDuplicate={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <Modal
        isOpen={showPageForm}
        onClose={() => {
          if (editor.page) {
            setShowPageForm(false);
          }
        }}
        title={editor.page ? 'Editar Página' : 'Nueva Página'}
        size="md"
      >
        <PageForm
          page={editor.page || undefined}
          onSubmit={handlePageFormSubmit}
          isLoading={isSaving}
        />
        {saveError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {saveError}
          </div>
        )}
      </Modal>
    </div>
  );
};

interface ResizableEditorProps {
  editor: ReturnType<typeof usePageEditor>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
}

const ResizableEditor: React.FC<ResizableEditorProps> = ({ editor, selectedId, onSelect, onDeleteComponent, onDuplicateComponent }) => {
  const [width, setWidth] = React.useState<number>(() => {
    try {
      const stored = localStorage.getItem('inspectorWidth');
      if (stored) return Math.min(Math.max(Number(stored), 260), 640);
    } catch {}
    return 320; // default
  });
  const [dragging, setDragging] = React.useState(false);
  const startXRef = React.useRef(0);
  const startWidthRef = React.useRef(0);

  React.useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const delta = startXRef.current - e.clientX; // mover izquierda aumenta ancho
      const next = Math.min(Math.max(startWidthRef.current + delta, 260), 640);
      setWidth(next);
    };
    const onUp = () => {
      setDragging(false);
      try { localStorage.setItem('inspectorWidth', String(width)); } catch {}
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, width]);

  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    setDragging(true);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <ComponentPalette />
      <ComponentCanvas
        components={editor.components}
        selectedComponentId={selectedId}
        onSelect={onSelect}
        editor={editor}
        onDeleteComponent={onDeleteComponent}
        onDuplicateComponent={onDuplicateComponent}
      />
      <div
        className="relative flex-shrink-0" 
        style={{ width }}
      >
        <div
          onPointerDown={startDrag}
          className={"absolute left-0 top-0 h-full w-1 cursor-col-resize z-10 " + (dragging ? 'bg-primary' : 'bg-transparent hover:bg-primary/40')}
        />
        <ComponentInspector component={editor.findComponent(selectedId)} editor={editor} />
      </div>
    </div>
  );
};
