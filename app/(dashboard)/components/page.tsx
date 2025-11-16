"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ApiResponse } from '@/types/page';
import { ComponentRegistryItem } from '@/types/components';
import { API_CONFIG } from '@/lib/config';

export default function ComponentsListPage() {
  const [items, setItems] = useState<ComponentRegistryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_CONFIG.url}/components`);
        const json: ApiResponse<ComponentRegistryItem[]> = await res.json();
        if (json.success && json.data) setItems(json.data);
        else setError(json.error || 'Error cargando componentes');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error desconocido');
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Componentes</h1>
        <div className="flex gap-2">
          <Link href="/components/new"><Button>Nuevo componente</Button></Link>
        </div>
      </div>

      <Card>
        <div className="p-4">
          {loading ? (
            <p>Cargando...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Nombre</th>
                    <th className="py-2 pr-4">Display</th>
                    <th className="py-2 pr-4">Categoría</th>
                    <th className="py-2 pr-4">Deprecado</th>
                    <th className="py-2 pr-4">SubElements</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(i => (
                    <tr key={i.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-mono">{i.component_name}</td>
                      <td className="py-2 pr-4">{i.display_name || '-'}</td>
                      <td className="py-2 pr-4">{i.category || '-'}</td>
                      <td className="py-2 pr-4">{i.deprecated ? 'Sí' : 'No'}</td>
                      <td className="py-2 pr-4">{i.definition?.subElements?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
