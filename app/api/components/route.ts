import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/page';
import { ComponentRegistryItem } from '@/types/components';

const PROXY_API_URL = (process.env.PROXY_API_URL || 'http://localhost:3012/api').replace(/\/$/, '');

// GET /api/components
export async function GET() {
  try {
    const upstream = await fetch(`${PROXY_API_URL}/components`);
    if (!upstream.ok) {
      throw new Error(`Backend error ${upstream.status}`);
    }
    const data = await upstream.json();
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Error desconocido' }, { status: 500 });
  }
}

// POST /api/components
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const upstream = await fetch(`${PROXY_API_URL}/components`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!upstream.ok) {
      throw new Error(`Backend error ${upstream.status}`);
    }
    const data = await upstream.json();
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Error desconocido' }, { status: 500 });
  }
}
