import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_PRODUCTS } from '@/lib/initialData';
import { Product } from '@/lib/types';

// In-memory cache for server-side responses
let serverProducts: Product[] = [...INITIAL_PRODUCTS];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search')?.toLowerCase();

  let filtered = serverProducts.filter((p) => p.isActive);

  if (category && category !== 'ALL') {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.features.some((f) => f.toLowerCase().includes(search))
    );
  }

  return NextResponse.json({ success: true, count: filtered.length, products: filtered });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newProduct: Product = {
      ...body,
      id: body.id || `prod-${Date.now()}`,
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      updatedAt: new Date().toISOString(),
      isActive: body.isActive !== undefined ? body.isActive : true,
    };

    serverProducts = [newProduct, ...serverProducts];
    return NextResponse.json({ success: true, product: newProduct });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid product data' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const index = serverProducts.findIndex((p) => p.id === body.id);
    if (index === -1) {
      serverProducts.push(body);
    } else {
      serverProducts[index] = { ...serverProducts[index], ...body, updatedAt: new Date().toISOString() };
    }
    return NextResponse.json({ success: true, product: body });
  } catch {
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
  }
  serverProducts = serverProducts.filter((p) => p.id !== id);
  return NextResponse.json({ success: true, message: 'Product deleted' });
}
