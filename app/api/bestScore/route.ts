import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const dictationId = searchParams.get('dictationId');

  if (!email || !dictationId) {
    return NextResponse.json(
      { message: 'Email ou dictationId manquant ou de type invalide' },
      { status: 400 },
    );
  }

  try {
    const bestScore = await prisma.score.findFirst({
      where: {
        user: { email },
        dictation_id: dictationId,
      },
      orderBy: { score: 'desc' },
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

    if (!bestScore) {
      return NextResponse.json(
        { message: 'Aucun score trouvé pour cet utilisateur et cette dictée' },
        { status: 404 },
      );
    }

    return NextResponse.json({ bestScore });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
