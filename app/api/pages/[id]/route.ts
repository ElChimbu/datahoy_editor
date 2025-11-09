import { NextRequest, NextResponse } from 'next/server';
import { getPageBySlug, updatePageBySlug, deletePageBySlug } from '@/lib/storage';
import { updatePageSchema } from '@/lib/validation';
import { ApiResponse, PageDefinition } from '@/types/page';

// GET /api/pages/[slug] - Obtener una página por slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const page = await getPageBySlug(params.slug);
    
    if (!page) {
      const response: ApiResponse<PageDefinition> = {
        success: false,
        error: 'Página no encontrada',
      };
      return NextResponse.json(response, { status: 404 });
    }
    
    const response: ApiResponse<PageDefinition> = {
      success: true,
      data: page,
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<PageDefinition> = {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/pages/[slug] - Actualizar una página
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    
    // Validar los datos
    const validationResult = updatePageSchema.safeParse(body);
    if (!validationResult.success) {
      const response: ApiResponse<PageDefinition> = {
        success: false,
        error: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    const page = await updatePageBySlug(params.slug, validationResult.data);
    const response: ApiResponse<PageDefinition> = {
      success: true,
      data: page,
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<PageDefinition> = {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
    const status = error instanceof Error && error.message.includes('no encontrada') ? 404 : 400;
    return NextResponse.json(response, { status });
  }
}

// DELETE /api/pages/[slug] - Eliminar una página
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await deletePageBySlug(params.slug);
    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: 'Página eliminada exitosamente' },
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<{ message: string }> = {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
    const status = error instanceof Error && error.message.includes('no encontrada') ? 404 : 500;
    return NextResponse.json(response, { status });
  }
}

