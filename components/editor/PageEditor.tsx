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
import { DragData } from '@/hooks/useDragAndDrop';
import { useToast } from '@/components/ui/Toast';

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
      // Check if dropped on canvas or on a component
      if (over.id === 'canvas' || (over.data.current as DragData)?.type === 'component') {
        editor.addComponent(activeData.componentType);
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
        }
      } else if (over.id === 'canvas') {
        // Dropped on canvas directly, move to end
        const activeIndex = editor.components.findIndex((c) => c.id === activeData.componentId);
        if (activeIndex !== -1) {
          const newComponents = [...editor.components];
          const [removed] = newComponents.splice(activeIndex, 1);
          newComponents.push(removed);
          editor.setComponents(newComponents);
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

      let result;
      if (editor.page.id) {
        result = await updatePage(editor.page.slug, pageData);
      } else {
        result = await createPage(pageData);
      }

      if (result.success && result.data) {
        editor.updatePage(result.data);
        editor.setComponents(result.data.components);
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

  // Eliminar componente y persistir inmediatamente
  const handleDeleteComponent = async (componentId: string) => {
    // Helper para crear el nuevo árbol sin el componente
    const deleteFromTree = (comps: ComponentDefinition[]): ComponentDefinition[] =>
      comps
        .filter((c) => c.id !== componentId)
        .map((c) => ({
          ...c,
          children: c.children ? deleteFromTree(c.children) : c.children,
        }));

    const prevComponents = editor.components;
    const nextComponents = deleteFromTree(prevComponents);
    editor.setComponents(nextComponents);

    if (!editor.page) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        slug: editor.page.slug,
        title: editor.page.title,
        metadata: editor.page.metadata,
        components: nextComponents,
      };
      const doPersist = async () => updatePage(editor.page!.slug, payload);
      const result = await doPersist();
      if (result.success && result.data) {
        editor.updatePage(result.data);
        editor.setComponents(result.data.components);
        if (onSave) onSave(result.data);
        toast.success('Componente eliminado');
      } else {
        const msg = result.error || 'Error al guardar la página';
        setSaveError(msg);
        // rollback
        editor.setComponents(prevComponents);
        toast.error(msg, {
          action: {
            label: 'Reintentar',
            onClick: async () => {
              try {
                setIsSaving(true);
                const retry = await doPersist();
                if (retry.success && retry.data) {
                  editor.updatePage(retry.data);
                  editor.setComponents(retry.data.components);
                  if (onSave) onSave(retry.data);
                  toast.success('Guardado');
                } else {
                  toast.error(retry.error || 'Falló nuevamente');
                }
              } finally {
                setIsSaving(false);
              }
            },
          },
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      setSaveError(msg);
      // rollback
      editor.setComponents(prevComponents);
      toast.error(msg, {
        action: {
          label: 'Reintentar',
          onClick: () => handleDeleteComponent(componentId),
        },
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
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
        <div className="flex-1 flex overflow-hidden">
          <ComponentPalette />
          <ComponentCanvas
            components={editor.components}
            selectedComponentId={editor.selectedComponentId}
            onSelect={editor.setSelectedComponentId}
            editor={editor}
            onDeleteComponent={handleDeleteComponent}
          />
          <ComponentInspector
            component={editor.findComponent(editor.selectedComponentId)}
            editor={editor}
          />
        </div>
        <DragOverlay>
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
