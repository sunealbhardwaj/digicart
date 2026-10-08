import { NextResponse } from 'next/server';
import { testDbConnection } from '@/lib/db';

export async function GET() {
  const result = await testDbConnection();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await testDbConnection();
  return NextResponse.json(result);
}
