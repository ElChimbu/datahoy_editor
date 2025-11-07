import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { PageDefinition, ComponentDefinition, ComponentType } from '@/types/page';
import { getComponentSchema } from '@/lib/components.registry';

export function usePageEditor(initialPage?: PageDefinition) {
  const [page, setPage] = useState<PageDefinition | null>(initialPage || null);
  const [components, setComponents] = useState<ComponentDefinition[]>(
    initialPage?.components || []
  );
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [history, setHistory] = useState<ComponentDefinition[][]>([
    initialPage?.components || [],
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const addComponent = useCallback((type: ComponentType, parentId?: string) => {
    const schema = getComponentSchema(type);
    if (!schema) return;

    const newComponent: ComponentDefinition = {
      type,
      id: nanoid(),
      props: { ...schema.defaultProps },
      children: schema.canHaveChildren ? [] : undefined,
    };

    setComponents((prev) => {
      if (!parentId) {
        return [...prev, newComponent];
      }

      const addToParent = (comps: ComponentDefinition[]): ComponentDefinition[] => {
        return comps.map((comp) => {
          if (comp.id === parentId) {
            return {
              ...comp,
              children: [...(comp.children || []), newComponent],
            };
          }
          if (comp.children) {
            return {
              ...comp,
              children: addToParent(comp.children),
            };
          }
          return comp;
        });
      };

      return addToParent(prev);
    });

    saveToHistory();
  }, []);

  const updateComponent = useCallback((id: string, props: any) => {
    setComponents((prev) => {
      const updateInTree = (comps: ComponentDefinition[]): ComponentDefinition[] => {
        return comps.map((comp) => {
          if (comp.id === id) {
            return { ...comp, props: { ...comp.props, ...props } };
          }
          if (comp.children) {
            return {
              ...comp,
              children: updateInTree(comp.children),
            };
          }
          return comp;
        });
      };

      return updateInTree(prev);
    });

    saveToHistory();
  }, []);

  const deleteComponent = useCallback((id: string) => {
    setComponents((prev) => {
      const deleteFromTree = (comps: ComponentDefinition[]): ComponentDefinition[] => {
        return comps
          .filter((comp) => comp.id !== id)
          .map((comp) => {
            if (comp.children) {
              return {
                ...comp,
                children: deleteFromTree(comp.children),
              };
            }
            return comp;
          });
      };

      return deleteFromTree(prev);
    });

    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }

    saveToHistory();
  }, [selectedComponentId]);

  const duplicateComponent = useCallback((id: string) => {
    setComponents((prev) => {
      const duplicateInTree = (comps: ComponentDefinition[]): ComponentDefinition[] => {
        return comps.flatMap((comp) => {
          if (comp.id === id) {
            const duplicated: ComponentDefinition = {
              ...comp,
              id: nanoid(),
              children: comp.children
                ? comp.children.map((child) => ({
                    ...child,
                    id: nanoid(),
                    children: child.children
                      ? child.children.map((gc) => ({ ...gc, id: nanoid() }))
                      : undefined,
                  }))
                : undefined,
            };
            return [comp, duplicated];
          }
          if (comp.children) {
            return [
              {
                ...comp,
                children: duplicateInTree(comp.children),
              },
            ];
          }
          return [comp];
        });
      };

      return duplicateInTree(prev);
    });

    saveToHistory();
  }, []);

  const moveComponent = useCallback((fromId: string, toId: string, position: 'before' | 'after' | 'inside') => {
    setComponents((prev) => {
      let componentToMove: ComponentDefinition | null = null;

      // Find and remove component
      const removeFromTree = (comps: ComponentDefinition[]): ComponentDefinition[] => {
        return comps
          .filter((comp) => {
            if (comp.id === fromId) {
              componentToMove = comp;
              return false;
            }
            return true;
          })
          .map((comp) => {
            if (comp.children) {
              return {
                ...comp,
                children: removeFromTree(comp.children),
              };
            }
            return comp;
          });
      };

      const withoutComponent = removeFromTree(prev);

      if (!componentToMove) return prev;

      // Insert component
      const insertInTree = (comps: ComponentDefinition[]): ComponentDefinition[] => {
        return comps.flatMap((comp) => {
          if (comp.id === toId) {
            if (position === 'inside') {
              return [
                {
                  ...comp,
                  children: [...(comp.children || []), componentToMove!],
                },
              ];
            }
            if (position === 'before') {
              return [componentToMove!, comp];
            }
            if (position === 'after') {
              return [comp, componentToMove!];
            }
          }
          if (comp.children) {
            return [
              {
                ...comp,
                children: insertInTree(comp.children),
              },
            ];
          }
          return [comp];
        });
      };

      return insertInTree(withoutComponent);
    });

    saveToHistory();
  }, []);

  const findComponent = useCallback((id: string | null): ComponentDefinition | null => {
    if (!id) return null;

    const findInTree = (comps: ComponentDefinition[]): ComponentDefinition | null => {
      for (const comp of comps) {
        if (comp.id === id) return comp;
        if (comp.children) {
          const found = findInTree(comp.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findInTree(components);
  }, [components]);

  const saveToHistory = useCallback(() => {
    setComponents((current) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(current)));
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return current;
    });
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setComponents(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setComponents(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  }, [history, historyIndex]);

  const updatePage = useCallback((updates: Partial<PageDefinition>) => {
    setPage((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  return {
    page,
    components,
    selectedComponentId,
    setSelectedComponentId,
    addComponent,
    updateComponent,
    deleteComponent,
    duplicateComponent,
    moveComponent,
    findComponent,
    updatePage,
    setComponents,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
}

