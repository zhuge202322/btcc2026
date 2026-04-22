import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let actualPassword = 'admin123';
    
    // Check Vercel KV first
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const data: any = await kv.get('app_config');
      if (data && data.adminPassword) {
        actualPassword = data.adminPassword;
      }
    } 
    // Fallback to local file
    else if (fs.existsSync(dataFilePath)) {
      try {
        const raw = fs.readFileSync(dataFilePath, 'utf-8');
        if (raw.trim()) {
          const data = JSON.parse(raw);
          if (data.adminPassword) actualPassword = data.adminPassword;
        }
      } catch(e) {}
    }
    
    if (body.password === actualPassword) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_auth', 'true', { path: '/', maxAge: 60 * 60 * 24 });
      return response;
    }
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
