import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/app/lib/prisma';

interface TopScore {
  id: string;
  score: number;
  pourcentage: number;
  correct_words: number;
  incorrect_words: number;
  userId: string;
  userName: string;
  user: {
    id: string;
    name: string;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dictationId = searchParams.get('dictationId');

  if (!dictationId) {
    return NextResponse.json(
      { message: 'dictationId manquant ou de type invalide' },
      { status: 400 },
    );
  }

  try {
    const topScores: TopScore[] = await prisma.$queryRaw`
      SELECT
        s.id,
        COALESCE(s.score, 0) as score,
        COALESCE(s.pourcentage, 0) as pourcentage,
        COALESCE(s.timer, 0) as timer,
        COALESCE(s.correct_words, 0) as correct_words,
        COALESCE(s.incorrect_words, 0) as incorrect_words,
        COALESCE(s.user_id, '') as "userId",
        COALESCE(u.id, '') as "user.id",
        COALESCE(u.name, 'Utilisateur inconnu') as "user.name"
      FROM "public"."score" s
      LEFT JOIN "public"."User" u ON s.user_id = u.id
      WHERE s.dictation_id = ${Prisma.sql`${dictationId}`}
      ORDER BY s.score DESC
      LIMIT 10;
    `;

    const uniqueTopScores = topScores.reduce((acc: TopScore[], current: TopScore) => {
      const userExists = acc.find((score) => score.userId === current.userId);
      if (!userExists) {
        acc.push(current);
      }
      return acc;
    }, []);

    return NextResponse.json({ topScores: uniqueTopScores });
  } catch (error) {
    console.error('Error fetching top scores:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
