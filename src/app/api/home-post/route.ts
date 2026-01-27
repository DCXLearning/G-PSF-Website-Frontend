// app/api/home-post/route.ts
import { API_URL } from '@/config/api';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const res = await fetch(`${API_URL}/pages/home/section`, {
            cache: 'no-store',
        });

        const json = await res.json();

        // get hero banner block
        const heroBlock = json?.data?.blocks?.find(
            (b: any) => b.type === 'hero-banner' && b.enabled
        );

        if (!heroBlock) {
            return NextResponse.json(
                { error: 'Hero banner not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(heroBlock);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch home hero banner' },
            { status: 500 }
        );
    }
}
