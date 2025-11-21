'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageEditor } from '@/components/editor/PageEditor';
import { PageDefinition } from '@/types/page';
import { getPageById } from '@/lib/api';

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const [page, setPage] = useState<PageDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageId = params.id as string;

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getPageById(pageId);
        if (result.success && result.data) {
          setPage(result.data);
        } else {
          setError(result.error || 'Error al cargar la página');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (pageId) {
      loadPage();
    }
  }, [pageId]);

  const handleSave = (savedPage: PageDefinition) => {
    setPage(savedPage);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando página...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/pages')}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark dark:bg-primary dark:hover:bg-primary-dark"
          >
            Volver a páginas
          </button>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Página no encontrada</p>
          <button
            onClick={() => router.push('/pages')}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark dark:bg-primary dark:hover:bg-primary-dark"
          >
            Volver a páginas
          </button>
        </div>
      </div>
    );
  }

  return <PageEditor page={page} onSave={handleSave} />;
}

