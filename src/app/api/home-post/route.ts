// app/api/home-post/route.ts
import { API_URL } from '@/config/api';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const res = await fetch(`${API_URL}/posts`, {
            cache: 'no-store', // always get fresh data
        });

        const json = await res.json();

        // Find post with id = 1
        const post = json.data.find((item: any) => item.id === 1);

        if (!post) {
            return NextResponse.json(
                { error: 'Post id=1 not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(post);
    } catch (err) {
        return NextResponse.json(
            { error: 'Failed to fetch home post' },
            { status: 500 }
        );
    }
}
