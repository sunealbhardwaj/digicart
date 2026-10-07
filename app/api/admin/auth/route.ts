import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const expectedUser = process.env.ADMIN_USERNAME || 'admin';
    const expectedPass = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === expectedUser && password === expectedPass) {
      // In production, we'd sign a JWT. Here we return a session token and set an httpOnly/secure cookie
      const token = `adm_token_${Buffer.from(`${username}:${Date.now()}`).toString('base64')}`;
      const response = NextResponse.json({
        success: true,
        message: 'Authentication successful',
        token,
        user: { username, role: 'SUPER_ADMIN' },
      });

      response.cookies.set('apex_admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Invalid username or password' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ success: false, error: 'Authentication request failed' }, { status: 400 });
  }
}
