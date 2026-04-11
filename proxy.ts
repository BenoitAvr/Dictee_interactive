import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/api/scores',
];

export async function proxy(request: NextRequest): Promise<NextResponse> {
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  if (PUBLIC_ROUTES.some((route: string) => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith('/api/')) {
    const token = await getToken({ 
      req: request,
      secret: process.env.SECRET,
    });

    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Non authentifié' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};