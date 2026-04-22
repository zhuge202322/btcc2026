import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

function getConfig() {
  try {
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
  const config = getConfig();
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
    const currentConfig = getConfig();
    const newConfig = { ...currentConfig, ...body };
    fs.writeFileSync(dataFilePath, JSON.stringify(newConfig, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error saving config' }, { status: 500 });
  }
}
