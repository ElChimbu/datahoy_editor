import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/page';

const PROXY_API_URL = (process.env.PROXY_API_URL || 'http://localhost:3012/api').replace(/\/$/, '');

// POST /api/components/bulk
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const upstream = await fetch(`${PROXY_API_URL}/components/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!upstream.ok) {
      throw new Error(`Backend error ${upstream.status}`);
    }
    const data = await upstream.json();
    return NextResponse.json({ success: true, data } as ApiResponse<{ inserted: number; skipped: number; count: number; }>);
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Error desconocido' }, { status: 400 });
  }
}
