import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { message: 'Email manquant ou de type invalide' },
      { status: 400 },
    );
  }

  try {
    const bestScores = await prisma.score.findMany({
      where: { user: { email } },
      orderBy: [{ dictation_id: 'asc' }, { score: 'desc' }],
      distinct: ['dictation_id'],
      select: {
        id: true,
        dictation: { select: { id: true, title: true, level: true } },
        note: true,
        score: true,
        timer: true,
        correct_words: true,
        incorrect_words: true,
        pourcentage: true,
      },
    });

    if (bestScores.length === 0) {
      return NextResponse.json(
        { message: 'Aucun score trouvé pour cet utilisateur' },
        { status: 404 },
      );
    }

    return NextResponse.json({ bestScores });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
