'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageEditor } from '@/components/editor/PageEditor';
import { PageDefinition } from '@/types/page';

export default function NewPage() {
  const router = useRouter();

  const handleSave = (page: PageDefinition) => {
    router.push(`/pages/${page.id}`);
    router.refresh();
  };

  return <PageEditor onSave={handleSave} />;
}

