import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_ORDERS } from '@/lib/initialData';
import { Order } from '@/lib/types';

let serverOrders: Order[] = [...INITIAL_ORDERS];

export async function GET() {
  return NextResponse.json({ success: true, count: serverOrders.length, orders: serverOrders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newOrder: Order = {
      ...body,
      id: body.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'DELIVERED',
    };
    serverOrders = [newOrder, ...serverOrders];
    return NextResponse.json({ success: true, order: newOrder });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid order data' }, { status: 400 });
  }
}
