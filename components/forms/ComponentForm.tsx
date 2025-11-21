'use client';

import React from 'react';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ComponentDefinition } from '@/types/page';
import { ComponentRegistryItem } from '@/types/components';
import { API_CONFIG } from '@/lib/config';
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

  // Modo genérico: editor de propiedades dinámicas para el tipo 'Component'
  if (schema.type === 'Component') {
    const [newKey, setNewKey] = React.useState('');
    const [newType, setNewType] = React.useState<'string' | 'number' | 'boolean'>('string');
    const [error, setError] = React.useState<string | null>(null);
    const [template, setTemplate] = React.useState<
      'none' | 'Section' | 'Text' | 'Image' | 'Container'
    >('none');
    const [componentName, setComponentName] = React.useState<string>(
      (component.props.component_name as string) || ''
    );
    const [registryItems, setRegistryItems] = React.useState<ComponentRegistryItem[]>([]);
    const [registryLoading, setRegistryLoading] = React.useState(false);
    const [nameQuery, setNameQuery] = React.useState('');
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const suggestions = React.useMemo(() => {
      const normalize = (s: string) => s.toLowerCase().replace(/[-_\s]/g, '');
      if (!nameQuery) return registryItems.slice(0, 8);
      const q = normalize(nameQuery);
      return registryItems.filter(i => normalize(i.component_name).includes(q)).slice(0, 8);
    }, [nameQuery, registryItems]);
    const [subElementErrors, setSubElementErrors] = React.useState<Record<number, string[]>>({});
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
    const selectedRegistryItem = React.useMemo(
      () => registryItems.find((r) => r.component_name === componentName),
      [registryItems, componentName]
    );

    // Componente interno para agregar opción a subElement
    const AddOptionField: React.FC<{ idx: number; component: ComponentDefinition; onUpdate: (p: any) => void }> = ({ idx, component, onUpdate }) => {
      const [optKey, setOptKey] = React.useState('');
      const [optValue, setOptValue] = React.useState('');
      const [err, setErr] = React.useState<string | null>(null);
      const submit = () => {
        const k = optKey.trim();
        if (!k) { setErr('Clave requerida'); return; }
        const subs = [...((component.props as any).subElements || [])];
        if (!subs[idx]) return;
        const target = { ...subs[idx] };
        const opts = { ...(target.options || {}) };
        if (opts.hasOwnProperty(k)) { setErr('Ya existe'); return; }
        opts[k] = optValue;
        target.options = opts;
        subs[idx] = target;
        onUpdate({ ...component.props, subElements: subs });
        setOptKey(''); setOptValue(''); setErr(null);
      };
      return (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 mb-1">
            <input
              className="w-28 border rounded px-2 py-1 text-[11px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="clave"
              value={optKey}
              onChange={(e) => setOptKey(e.target.value)}
            />
            <input
              className="flex-1 border rounded px-2 py-1 text-[11px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="valor"
              value={optValue}
              onChange={(e) => setOptValue(e.target.value)}
            />
            <button
              type="button"
              className="text-[10px] px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100"
              onClick={submit}
            >
              añadir
            </button>
          </div>
          {err && <div className="text-[10px] text-red-600">{err}</div>}
        </div>
      );
    };

    // Cargar lista de componentes del registry
    React.useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          setRegistryLoading(true);
          const base = API_CONFIG.url || '/api';
          const res = await fetch(`${base.replace(/\/$/, '')}/components`);
          const json = await res.json();
          if (cancelled) return;
          let list: any[] = [];
          if (json && json.success) {
            if (Array.isArray(json.data)) list = json.data;
            else if (json.data && Array.isArray(json.data.data)) list = json.data.data;
          } else if (Array.isArray(json)) {
            list = json;
          }
          if (list.length > 0) setRegistryItems(list as ComponentRegistryItem[]);
        } catch (_) {
          // Silencioso
        } finally {
          if (!cancelled) setRegistryLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, []);

    // Sincronizar prop especial component_name cuando cambia el estado local
    React.useEffect(() => {
      const currentNameProp = component.props.component_name as string | undefined;
      if (currentNameProp !== componentName) {
        const next = { ...component.props };
        if (componentName) next.component_name = componentName; else delete next.component_name;
        onUpdate(next);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [componentName]);

    // Inicializar subElements desde el registry si existe y aún no están en props
    React.useEffect(() => {
      if (!selectedRegistryItem) return;
      const registrySubs = selectedRegistryItem.definition?.subElements || [];
      const currentSubs = Array.isArray((component.props as any).subElements)
        ? (component.props as any).subElements
        : undefined;
      if (!currentSubs || currentSubs.length === 0) {
        if (registrySubs.length > 0) {
          const next = { ...component.props, subElements: registrySubs.map(s => ({ ...s })) };
          onUpdate(next);
        }
      }
      // Agregar metadatos del registry al componente si no existen todavía
      const metaKeys: Array<keyof ComponentRegistryItem> = ['display_name', 'category', 'version'];
      const metaPatch: Record<string, any> = {};
      metaKeys.forEach(k => {
        const value = (selectedRegistryItem as any)[k];
        if (value && !(component.props as any)[k]) {
          metaPatch[k] = value;
        }
      });
      if (Object.keys(metaPatch).length > 0) {
        onUpdate({ ...component.props, ...metaPatch });
      }
    }, [selectedRegistryItem]);

    const updateSubElementField = (index: number, field: string, value: any) => {
      const subs = Array.isArray((component.props as any).subElements)
        ? ([...(component.props as any).subElements] as any[])
        : [];
      if (!subs[index]) return;
      subs[index] = { ...subs[index], [field]: value };
      const next = { ...component.props, subElements: subs };
      onUpdate(next);
      validateSubElements(subs);
    };

    const removeSubElement = (index: number) => {
      const subs = Array.isArray((component.props as any).subElements)
        ? ([...(component.props as any).subElements] as any[])
        : [];
      subs.splice(index, 1);
      const next = { ...component.props } as any;
      if (subs.length > 0) next.subElements = subs; else delete next.subElements;
      onUpdate(next);
      validateSubElements(subs);
    };

    const addSubElement = () => {
      const subs = Array.isArray((component.props as any).subElements)
        ? ([...(component.props as any).subElements] as any[])
        : [];
      subs.push({ subelement_name: 'nuevo', href: '' });
      const next = { ...component.props, subElements: subs };
      onUpdate(next);
      validateSubElements(subs);
    };

    const updateProp = (key: string, value: any) => {
      const next = { ...component.props, [key]: value };
      onUpdate(next);
    };

    const removeProp = (key: string) => {
      const next: any = { ...component.props };
      delete next[key];
      onUpdate(next);
    };

    const addProp = () => {
      const key = newKey.trim();
      if (!key) {
        setError('Ingresa un nombre de propiedad');
        return;
      }
      if (component.props.hasOwnProperty(key)) {
        setError('La propiedad ya existe');
        return;
      }
      setError(null);
      const def = newType === 'string' ? '' : newType === 'number' ? 0 : false;
      const next = { ...component.props, [key]: def };
      onUpdate(next);
      setNewKey('');
      setNewType('string');
    };

    const applyTemplate = () => {
      if (template === 'none') return;
      const tpl = getComponentSchema(template as any);
      if (!tpl) return;
      const next = { ...tpl.defaultProps, ...component.props };
      onUpdate(next);
    };

    const moveSubElement = (from: number, to: number) => {
      if (from === to) return;
      const subs = Array.isArray((component.props as any).subElements)
        ? ([...(component.props as any).subElements] as any[])
        : [];
      if (to < 0 || to >= subs.length) return;
      const item = subs.splice(from, 1)[0];
      subs.splice(to, 0, item);
      const next = { ...component.props, subElements: subs };
      onUpdate(next);
      validateSubElements(subs);
    };

    const handleDragEnd = (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      const subs = (component.props as any).subElements || [];
      const ids = subs.map((se: any, i: number) => (se.id ? 'sub-' + se.id : 'sub-index-' + i));
      const from = ids.indexOf(active.id as string);
      const to = ids.indexOf(over.id as string);
      if (from !== -1 && to !== -1) moveSubElement(from, to);
    };

    const validateSubElements = (subs: any[]) => {
      const errs: Record<number, string[]> = {};
      const names: Record<string, number[]> = {};
      subs.forEach((se, i) => {
        const list: string[] = [];
        const name = (se.subelement_name || '').trim();
        if (!name) list.push('Nombre requerido');
        if (name) {
          names[name] = names[name] ? [...names[name], i] : [i];
        }
        const href = (se.href || '').trim();
        if (href && !href.startsWith('/') && !href.startsWith('http')) {
          list.push('href debe iniciar con / o http');
        }
        errs[i] = list;
      });
      Object.entries(names).forEach(([n, idxs]) => {
        if (idxs.length > 1) {
          idxs.forEach(i => {
            errs[i] = [...errs[i], 'Nombre duplicado'];
          });
        }
      });
      setSubElementErrors(errs);
    };

    // Sub-element item component (extract to avoid hooks-in-loop and provide handle)
    const SubElementItem: React.FC<{
      id: string;
      idx: number;
      se: any;
      component: ComponentDefinition;
      onUpdate: (p: any) => void;
      removeSubElement: (i: number) => void;
      updateSubElementField: (i: number, field: string, value: any) => void;
      validateSubElements: (subs: any[]) => void;
      subElementErrors: Record<number, string[]>;
      moveSubElement: (from: number, to: number) => void;
    }> = ({ id, idx, se, component, onUpdate, removeSubElement, updateSubElementField, validateSubElements, subElementErrors, moveSubElement }) => {
      const reservedKeys = new Set(['id', 'options']);
      const primitiveEntries = Object.entries(se).filter(([k, v]) => typeof v !== 'object' || v === null);
      const [newFieldKey, setNewFieldKey] = React.useState('');
      const [newFieldValue, setNewFieldValue] = React.useState('');
      const [newFieldType, setNewFieldType] = React.useState<'string' | 'number' | 'boolean'>('string');
      const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id });
      const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      };

      return (
        <div ref={setNodeRef} style={style} className="mb-3 p-2 border rounded bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-600">
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="flex-1">
              <div className="grid gap-2">
                {primitiveEntries.map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2">
                    <input
                      className={"w-32 border rounded px-2 py-1 text-[11px] bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 " + (reservedKeys.has(k) ? 'cursor-not-allowed opacity-60' : '')}
                      value={k}
                      readOnly
                    />
                    {typeof v === 'boolean' ? (
                      <label className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-gray-200">
                        <input
                          type="checkbox"
                          checked={Boolean(v)}
                          disabled={reservedKeys.has(k)}
                          onChange={(e) => {
                            if (reservedKeys.has(k)) return;
                            updateSubElementField(idx, k, e.target.checked);
                          }}
                        />
                        {k}
                      </label>
                    ) : (
                      <input
                        className="flex-1 border rounded px-2 py-1 text-[11px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        value={String(v || '')}
                        readOnly={reservedKeys.has(k)}
                        onChange={(e) => {
                          if (reservedKeys.has(k)) return;
                          updateSubElementField(idx, k, e.target.value);
                        }}
                      />
                    )}
                    {!reservedKeys.has(k) && (
                      <button
                        type="button"
                        className="text-[10px] text-red-600 hover:underline dark:text-red-400"
                        onClick={() => {
                          const subs = [...(component.props as any).subElements];
                          const clone = { ...subs[idx] };
                          delete clone[k];
                          subs[idx] = clone;
                          onUpdate({ ...component.props, subElements: subs });
                        }}
                      >
                        borrar
                      </button>
                    )}
                  </div>
                ))}
                {/* Agregar nuevo campo al subElement */}
                <div className="flex items-center gap-2 mt-1">
                  <input
                    className="w-32 border rounded px-2 py-1 text-[11px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100"
                    placeholder="nuevoCampo"
                    value={newFieldKey}
                    onChange={(e) => setNewFieldKey(e.target.value)}
                  />
                  <input
                    className="flex-1 border rounded px-2 py-1 text-[11px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100"
                    placeholder="valor"
                    value={newFieldValue}
                    onChange={(e) => setNewFieldValue(e.target.value)}
                  />
                  <select
                    className="border rounded px-2 py-1 text-[11px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100"
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as any)}
                  >
                    <option value="string">str</option>
                    <option value="number">num</option>
                    <option value="boolean">bool</option>
                  </select>
                  <button
                    type="button"
                    className="text-[10px] px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100"
                    onClick={() => {
                      const key = newFieldKey.trim();
                      if (!key || reservedKeys.has(key) || se.hasOwnProperty(key)) return;
                      const subs = [...(component.props as any).subElements];
                      let parsed: any = newFieldValue;
                      if (newFieldType === 'number') parsed = Number(newFieldValue) || 0;
                      if (newFieldType === 'boolean') parsed = newFieldValue === 'true';
                      subs[idx] = { ...subs[idx], [key]: parsed };
                      onUpdate({ ...component.props, subElements: subs });
                      validateSubElements(subs);
                      setNewFieldKey('');
                      setNewFieldValue('');
                      setNewFieldType('string');
                    }}
                  >
                    añadir
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <button
                  {...attributes}
                  {...listeners}
                  title="Arrastrar"
                  className="text-[12px] p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>
          {/* Opciones del subElement */}
          <div className="mb-2">
            <details className="group">
              <summary className="cursor-pointer text-[11px] text-gray-600 dark:text-gray-300 flex items-center justify-between">
                <span className="group-open:font-medium">Options</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">{se.options ? Object.keys(se.options).length : 0} campos</span>
              </summary>
              <div className="mt-2 space-y-2">
                {se.options && Object.entries(se.options).map(([okey, oval]: any) => (
                  <div key={okey} className="flex items-center gap-2">
                    <input
                      className="w-28 border rounded px-2 py-1 text-[11px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100"
                      value={okey}
                      readOnly
                    />
                    <input
                      className="flex-1 border rounded px-2 py-1 text-[11px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100"
                      value={String(oval)}
                      onChange={(e) => {
                        const subs = [...(component.props as any).subElements];
                        const target = { ...subs[idx] };
                        const opts = { ...(target.options || {}) };
                        opts[okey] = e.target.value;
                        target.options = opts;
                        subs[idx] = target;
                        onUpdate({ ...component.props, subElements: subs });
                      }}
                    />
                    <button
                      type="button"
                      className="text-[10px] text-red-600 hover:underline dark:text-red-400"
                      onClick={() => {
                        const subs = [...(component.props as any).subElements];
                        const target = { ...subs[idx] };
                        const opts = { ...(target.options || {}) };
                        delete opts[okey];
                        target.options = opts;
                        subs[idx] = target;
                        onUpdate({ ...component.props, subElements: subs });
                      }}
                    >
                      borrar
                    </button>
                  </div>
                ))}
                <AddOptionField idx={idx} component={component} onUpdate={onUpdate} />
              </div>
            </details>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-400 dark:text-gray-500">#{idx + 1}</span>
            <div className="flex items-center gap-2">
              {subElementErrors[idx] && subElementErrors[idx].length > 0 && (
                <span className="text-[10px] text-red-600 dark:text-red-400" title={subElementErrors[idx].join('\n')}>
                  {subElementErrors[idx].length} err
                </span>
              )}
              <button
                type="button"
                className="text-[10px] text-gray-500 dark:text-gray-400 hover:underline"
                onClick={() => moveSubElement(idx, idx - 1)}
                disabled={idx === 0}
              >↑</button>
              <button
                type="button"
                className="text-[10px] text-gray-500 dark:text-gray-400 hover:underline"
                onClick={() => moveSubElement(idx, idx + 1)}
                disabled={idx === (component.props as any).subElements.length - 1}
              >↓</button>
              <button
                type="button"
                className="text-[10px] text-red-600 hover:underline dark:text-red-400"
                onClick={() => removeSubElement(idx)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        {/* Nombre del componente con autocompletado */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Nombre del componente</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Ej: hero-banner"
            value={componentName}
            onChange={(e) => {
              const val = e.target.value;
              setComponentName(val);
              setNameQuery(val);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // Retraso para permitir clic en sugerencia
              setTimeout(() => setShowSuggestions(false), 120);
            }}
          />
          {showSuggestions && (
            <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-sm max-h-52 overflow-auto text-sm">
              {registryLoading && (
                <div className="px-3 py-2 text-gray-400 dark:text-gray-500">Cargando...</div>
              )}
              {!registryLoading && suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="flex w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setComponentName(s.component_name);
                    setShowSuggestions(false);
                  }}
                >
                  <span className="font-mono text-xs mr-2 text-gray-600 dark:text-gray-300">{s.component_name}</span>
                  <span className="text-gray-500 dark:text-gray-400 flex-1 truncate">{s.display_name || '—'}</span>
                  {s.deprecated && (
                    <span className="text-red-500 text-[10px] ml-2">deprecated</span>
                  )}
                </button>
              ))}
              {!registryLoading && suggestions.length === 0 && (
                <div className="px-3 py-2 text-gray-400 dark:text-gray-500">
                  {nameQuery ? 'Sin coincidencias' : 'No hay componentes registrados'}
                </div>
              )}
            </div>
          )}
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
              onClick={() => setComponentName('')}
            >
              Limpiar
            </button>
            <button
              type="button"
              className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
              onClick={() => setShowSuggestions((s) => !s)}
            >
              {showSuggestions ? 'Ocultar' : 'Ver todos'}
            </button>
          </div>
          {selectedRegistryItem && (
            <div className="mt-3 p-2 border rounded bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-300">Display:</span>{' '}
                <span className="text-gray-700 dark:text-gray-200">{selectedRegistryItem.display_name || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-300">Categoría:</span>{' '}
                <span className="text-gray-700 dark:text-gray-200">{selectedRegistryItem.category || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-300">Versión:</span>{' '}
                <span className="text-gray-700 dark:text-gray-200">{selectedRegistryItem.version || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-300">Deprecado:</span>{' '}
                <span className={selectedRegistryItem.deprecated ? 'text-red-600' : 'text-green-600'}>
                  {selectedRegistryItem.deprecated ? 'Sí' : 'No'}
                </span>
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Propiedades (dinámicas)</div>
          {Object.entries(component.props)
            .filter(([k]) => k !== 'component_name' && k !== 'subElements').length === 0 && (
            <div className="text-sm text-gray-400 dark:text-gray-500 mb-2">No hay propiedades. Agrega una abajo.</div>
          )}
          {Object.entries(component.props)
            .filter(([k]) => k !== 'component_name' && k !== 'subElements')
            .map(([key, value]) => (
            <div key={key} className="mb-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{key}</label>
              {typeof value === 'boolean' ? (
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) => updateProp(key, e.target.checked)}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{key}</span>
                </label>
              ) : typeof value === 'number' ? (
                <input
                  className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  type="number"
                  value={Number(value)}
                  onChange={(e) => updateProp(key, e.target.value === '' ? 0 : Number(e.target.value))}
                />
              ) : (
                <input
                  className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  type="text"
                  value={String(value)}
                  onChange={(e) => updateProp(key, e.target.value)}
                />
              )}
              <div className="mt-1 text-right">
                <button
                  type="button"
                  className="text-xs text-red-600 hover:underline dark:text-red-400"
                  onClick={() => removeProp(key)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {/* SubElements editor */}
          {Array.isArray((component.props as any).subElements) && (
            <div className="mt-4 border-t pt-3 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Sub Elements</span>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                  onClick={addSubElement}
                >
                  Añadir
                </button>
              </div>
              {/* Drag & Drop wrapper */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={(component.props as any).subElements.map((se: any, i: number) => (se.id ? 'sub-' + se.id : 'sub-index-' + i))}
                  strategy={verticalListSortingStrategy}
                >
              {(component.props as any).subElements.map((se: any, idx: number) => {
                const sortableId = se.id ? 'sub-' + se.id : 'sub-index-' + idx;
                return (
                  <SubElementItem
                    key={sortableId}
                    id={sortableId}
                    idx={idx}
                    se={se}
                    component={component}
                    onUpdate={onUpdate}
                    removeSubElement={removeSubElement}
                    updateSubElementField={updateSubElementField}
                    validateSubElements={validateSubElements}
                    subElementErrors={subElementErrors}
                    moveSubElement={moveSubElement}
                  />
                );
              })}
              </SortableContext>
              </DndContext>
              {(component.props as any).subElements.length === 0 && (
                <div className="text-xs text-gray-400 dark:text-gray-500">No hay sub elements.</div>
              )}
            </div>
          )}
        </div>
        <div className="border-t pt-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Agregar propiedad</div>
          <div className="flex-wrap justify-between flex items-center gap-2">
            <input
              className="flex-1 border rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="nombre"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
            />
            <select
              className="border rounded px-2 py-2 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100"
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
            >
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
            </select>
            <button
              type="button"
              className="border rounded px-3 py-2 w-full text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100"
              onClick={addProp}
            >
              Agregar
            </button>
          </div>
          {error && <div className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</div>}
          
        </div>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema.propsSchema),
    // Ensure defaultValues is always an object — some components may have
    // primitive props by mistake, which breaks react-hook-form internals.
    defaultValues: typeof component.props === 'object' && component.props !== null ? component.props : {},
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
      {Object.entries(typeof component.props === 'object' && component.props !== null ? component.props : {}).map(([key, value]) => renderField(key, value))}
    </form>
  );
};

