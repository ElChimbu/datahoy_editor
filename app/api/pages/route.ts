import { NextRequest, NextResponse } from 'next/server';
import { getPages, createPage } from '@/lib/storage';
import { createPageSchema } from '@/lib/validation';
import { ApiResponse, PageDefinition } from '@/types/page';

// GET /api/pages - Listar todas las páginas
export async function GET() {
  try {
    const pages = await getPages();
    const response: ApiResponse<PageDefinition[]> = {
      success: true,
      data: pages,
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<PageDefinition[]> = {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/pages - Crear una nueva página
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar los datos
    const validationResult = createPageSchema.safeParse(body);
    if (!validationResult.success) {
      const response: ApiResponse<PageDefinition> = {
        success: false,
        error: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    const page = await createPage(validationResult.data);
    const response: ApiResponse<PageDefinition> = {
      success: true,
      data: page,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const response: ApiResponse<PageDefinition> = {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
    return NextResponse.json(response, { status: 400 });
  }
}

