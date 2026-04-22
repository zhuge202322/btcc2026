import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authCookie = request.headers.get('cookie')?.includes('admin_auth=true');
  if (authCookie) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
