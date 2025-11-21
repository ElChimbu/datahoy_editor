"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ApiResponse } from '@/types/page';
import { ComponentRegistryItem } from '@/types/components';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { API_CONFIG } from '@/lib/config';

interface SubElement { id: string; subelement_name: string; href?: string; options?: Record<string, any>; }

export default function NewComponentPage() {
  const router = useRouter();
  const [componentName, setComponentName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState('');
  const [version, setVersion] = useState('');
  const [deprecated, setDeprecated] = useState(false);
  const [subElements, setSubElements] = useState<SubElement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function toKebab(s: string) {
    return s
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const name = toKebab(componentName);
    if (!/^[a-z][a-z0-9\-]{1,49}$/.test(name)) {
      setError('Nombre inválido. Use kebab-case: ^[a-z][a-z0-9-]{1,49}$');
      return;
    }
    setSaving(true);
    try {
      const body: Omit<ComponentRegistryItem, 'id' | 'created_at' | 'updated_at'> = {
        component_name: name,
        display_name: displayName || undefined,
        category: category || undefined,
        version: version || undefined,
        deprecated,
        definition: { subElements },
      };
      const base = API_CONFIG.url || '/api';
      const res = await fetch(`${base.replace(/\/$/, '')}/components`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json: ApiResponse<ComponentRegistryItem> = await res.json();
      if (!json.success) throw new Error(json.error || 'Error al crear el componente');
      router.push('/components');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  }

  function addSubElement() {
    const id = Math.random().toString(36).slice(2);
    setSubElements(prev => [...prev, { id, subelement_name: '' }]);
  }

  function updateSubElement(id: string, patch: Partial<SubElement>) {
    setSubElements(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }

  function removeSubElement(id: string) {
    setSubElements(prev => prev.filter(s => s.id !== id));
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Nuevo componente</h1>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="p-4 space-y-4">
          {error && <p className="text-red-500">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">component_name (kebab-case)</label>
              <Input value={componentName} onChange={e => setComponentName(e.target.value)} placeholder="header-global" />
            </div>
            <div>
              <label className="text-sm text-gray-500">display_name</label>
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Header Global" />
            </div>
            <div>
              <label className="text-sm text-gray-500">category</label>
              <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="layout | content | media" />
            </div>
            <div>
              <label className="text-sm text-gray-500">version</label>
              <Input value={version} onChange={e => setVersion(e.target.value)} placeholder="1.0.0" />
            </div>
            <div className="flex items-center gap-2">
              <input id="deprecated" type="checkbox" checked={deprecated} onChange={e => setDeprecated(e.target.checked)} />
              <label htmlFor="deprecated">deprecated</label>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium">SubElements</h2>
              <Button type="button" onClick={addSubElement}>Agregar</Button>
            </div>

            <DndContext collisionDetection={closestCenter}>
              <SortableContext items={subElements.map(s => s.id!)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {subElements.map((s, idx) => (
                    <div key={s.id} className="border rounded p-3 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-sm text-gray-500">subelement_name</label>
                          <Input value={s.subelement_name} onChange={e => updateSubElement(s.id!, { subelement_name: e.target.value })} placeholder="tenis" />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">href</label>
                          <Input value={s.href || ''} onChange={e => updateSubElement(s.id!, { href: e.target.value })} placeholder="/ejemplo" />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">options (JSON)</label>
                          <Textarea value={JSON.stringify(s.options || {}, null, 0)} onChange={e => {
                            try { updateSubElement(s.id!, { options: e.target.value ? JSON.parse(e.target.value) : undefined }); }
                            catch { /* ignore invalid json while typing */ }
                          }} placeholder='{"id":"x","name":"y"}' />
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>#{idx + 1}</span>
                        <button type="button" className="text-red-600" onClick={() => removeSubElement(s.id!)}>Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
