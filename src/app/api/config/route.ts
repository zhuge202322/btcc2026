import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

async function getConfig() {
  try {
    // 1. Try fetching from Vercel KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const data: any = await kv.get('app_config');
      if (data) {
        return { checkInReward: '1', adminPassword: 'admin123', ...data };
      }
    }
    
    // 2. Local File Fallback (Local Dev)
    if (!fs.existsSync(dataFilePath)) {
      return { wsNumber: '', groupLink: '', checkInReward: '1', adminPassword: 'admin123' };
    }
    const raw = fs.readFileSync(dataFilePath, 'utf-8');
    if (!raw.trim()) return { wsNumber: '', groupLink: '', checkInReward: '1', adminPassword: 'admin123' };
    return { checkInReward: '1', adminPassword: 'admin123', ...JSON.parse(raw) };
  } catch (error) {
    return { wsNumber: '', groupLink: '', checkInReward: '1', adminPassword: 'admin123' };
  }
}

export async function GET() {
  const config = await getConfig();
  const { adminPassword, ...safeConfig } = config;
  return NextResponse.json(safeConfig);
}

export async function POST(request: Request) {
  const authCookie = request.headers.get('cookie')?.includes('admin_auth=true');
  if (!authCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const currentConfig = await getConfig();
    const newConfig = { ...currentConfig, ...body };

    // Save to Vercel KV if configured, else save locally
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      await kv.set('app_config', newConfig);
    } else {
      fs.writeFileSync(dataFilePath, JSON.stringify(newConfig, null, 2));
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Config Save Error:", error);
    return NextResponse.json({ error: 'Error saving config' }, { status: 500 });
  }
}
