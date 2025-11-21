import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, PageDefinition } from '@/types/page';

// Base del backend externo (incluye /api)
const PROXY_API_URL = (process.env.PROXY_API_URL || 'http://localhost:3012/api').replace(/\/$/, '');

// GET /api/pages/[id] - Proxy a backend (id puede ser slug o id según backend)
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const upstream = await fetch(`${PROXY_API_URL}/pages/${params.id}`);
    if (upstream.status === 404) {
      return NextResponse.json({ success: false, error: 'Página no encontrada' }, { status: 404 });
    }
    if (!upstream.ok) {
      throw new Error(`Backend error ${upstream.status}`);
    }
    const data = await upstream.json();
    return NextResponse.json({ success: true, data } as ApiResponse<PageDefinition>);
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Error desconocido' }, { status: 500 });
  }
}

// PUT /api/pages/[id] - Proxy actualización
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const upstream = await fetch(`${PROXY_API_URL}/pages/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (upstream.status === 404) {
      return NextResponse.json({ success: false, error: 'Página no encontrada' }, { status: 404 });
    }
    if (!upstream.ok) {
      throw new Error(`Backend error ${upstream.status}`);
    }
    const data = await upstream.json();
    return NextResponse.json({ success: true, data } as ApiResponse<PageDefinition>);
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Error desconocido' }, { status: 400 });
  }
}

// DELETE /api/pages/[id] - Proxy borrado
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const upstream = await fetch(`${PROXY_API_URL}/pages/${params.id}`, { method: 'DELETE' });
    if (upstream.status === 404) {
      return NextResponse.json({ success: false, error: 'Página no encontrada' }, { status: 404 });
    }
    if (!upstream.ok) {
      throw new Error(`Backend error ${upstream.status}`);
    }
    const data = await upstream.json();
    return NextResponse.json({ success: true, data } as ApiResponse<{ message: string }>);
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Error desconocido' }, { status: 500 });
  }
}

