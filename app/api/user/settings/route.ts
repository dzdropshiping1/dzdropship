import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/user/settings
 * Returns the current user's settings (e.g. sofizPayPublicKey)
 */
export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        sofizPayPublicKey: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ settings: user });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/user/settings
 * Updates the current user's settings
 * Body: { sofizPayPublicKey?: string }
 */
export async function PATCH(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sofizPayPublicKey } = body as { sofizPayPublicKey?: string };

    // Validate: if provided, must start with 'G' (Stellar public key format used by SofizPay)
    if (sofizPayPublicKey !== undefined && sofizPayPublicKey !== '') {
      if (!sofizPayPublicKey.startsWith('G') || sofizPayPublicKey.length < 10) {
        return NextResponse.json(
          { error: 'المفتاح العام لـ SofizPay غير صالح. يجب أن يبدأ بـ G.' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(sofizPayPublicKey !== undefined && {
          sofizPayPublicKey: sofizPayPublicKey === '' ? null : sofizPayPublicKey,
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        sofizPayPublicKey: true,
      },
    });

    return NextResponse.json({ success: true, settings: updatedUser });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
