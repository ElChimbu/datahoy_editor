'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageDefinition } from '@/types/page';
import { getPages, deletePage } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export default function PagesList() {
  const [pages, setPages] = useState<PageDefinition[]>([]);
  const [filteredPages, setFilteredPages] = useState<PageDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = pages.filter(
        (page) =>
          page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.slug.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPages(filtered);
    } else {
      setFilteredPages(pages);
    }
  }, [searchQuery, pages]);

  const loadPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPages();
      if (result.success && result.data) {
        setPages(result.data);
        setFilteredPages(result.data);
      } else {
        setError(result.error || 'Error al cargar las páginas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la página "${title}"?`)) {
      return;
    }

    try {
      const result = await deletePage(id);
      if (result.success) {
        setPages(pages.filter((page) => page.id !== id));
        setFilteredPages(filteredPages.filter((page) => page.id !== id));
      } else {
        alert(result.error || 'Error al eliminar la página');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando páginas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Páginas</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las páginas de tu sitio
          </p>
        </div>
        <Link href="/pages/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Página
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar páginas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {filteredPages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchQuery ? 'No se encontraron páginas' : 'No hay páginas creadas'}
          </p>
          {!searchQuery && (
            <Link href="/pages/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear primera página
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPages.map((page) => (
            <Card key={page.id} hover>
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{page.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Slug:</span> {page.slug}
                  </p>
                  {page.metadata?.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {page.metadata.description}
                    </p>
                  )}
                  <div className="text-xs text-gray-400">
                    {page.components.length} componente(s)
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Link href={`/pages/${page.id}`} className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(page.id, page.title)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

