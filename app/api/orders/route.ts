import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_ORDERS } from '@/lib/initialData';
import { Order } from '@/lib/types';
import { getDbOrders, saveDbOrder, isDbConfigured } from '@/lib/db';

let serverOrders: Order[] = [...INITIAL_ORDERS];

export async function GET() {
  let ordersList = serverOrders;
  if (isDbConfigured()) {
    try {
      const dbOrders = await getDbOrders();
      if (dbOrders && dbOrders.length > 0) {
        ordersList = dbOrders;
        serverOrders = dbOrders;
      }
    } catch {
      // Gracefully fall back to server cache
    }
  }

  return NextResponse.json({ success: true, count: ordersList.length, orders: ordersList });
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

    // Try saving to MySQL only if database is configured
    if (isDbConfigured()) {
      saveDbOrder(newOrder).catch(() => {});
    }

    return NextResponse.json({ success: true, order: newOrder });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid order data' }, { status: 400 });
  }
}
