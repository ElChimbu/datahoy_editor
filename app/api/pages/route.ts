import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/page';

// URL base del backend externo (incluye /api)
const PROXY_API_URL = (process.env.PROXY_API_URL || 'http://localhost:3012/api').replace(/\/$/, '');

// GET /api/pages - proxy listado
export async function GET() {
  try {
    const upstream = await fetch(`${PROXY_API_URL}/pages`);
    if (!upstream.ok) {
      throw new Error(`Backend error ${upstream.status}`);
    }
    const data = await upstream.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 });
  }
}

// POST /api/pages - proxy creación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const upstream = await fetch(`${PROXY_API_URL}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!upstream.ok) {
      throw new Error(`Backend error ${upstream.status}`);
    }
    const data = await upstream.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 });
  }
}

// PUT /api/pages?id=ID - proxy actualización
export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) throw new Error('ID de página no proporcionado');
    const body = await request.json();
    const upstream = await fetch(`${PROXY_API_URL}/pages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!upstream.ok) {
      throw new Error(`Backend error ${upstream.status}`);
    }
    const data = await upstream.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 });
  }
}

// DELETE /api/pages?id=ID - proxy borrado
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) throw new Error('ID de página no proporcionado');
    const upstream = await fetch(`${PROXY_API_URL}/pages/${id}`, { method: 'DELETE' });
    if (!upstream.ok) {
      throw new Error(`Backend error ${upstream.status}`);
    }
    const data = await upstream.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 });
  }
}

