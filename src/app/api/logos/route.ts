// app/api/logos/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api-gpsf.datacolabx.com/api/v1/logo'); // server-to-server
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch logos' }, { status: 500 });
  }
}
