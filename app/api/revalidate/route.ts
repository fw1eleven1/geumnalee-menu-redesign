import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');

  // 간단한 보안 체크 (선택사항)
  if (process.env.REVALIDATE_SECRET && secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { path } = body;

    if (path) {
      // 특정 경로만 재검증
      revalidatePath(path);
    } else {
      // 모든 메뉴 페이지 재검증
      revalidatePath('/');
      revalidatePath('/tapas');
      revalidatePath('/wines/conventional');
      revalidatePath('/wines/natural');
      revalidatePath('/wines/glass');
    }

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch {
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 });
  }
}
