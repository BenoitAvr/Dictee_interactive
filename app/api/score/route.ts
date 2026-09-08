import { NextResponse } from 'next/server';
import { createScore } from '@/app/lib/data_prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      score,
      correct_words,
      incorrect_words,
      pourcentage,
      timer,
      userEmail,
      dictationId,
      note,
    } = body;

    const createdScore = await createScore({
      score,
      correct_words,
      incorrect_words,
      pourcentage,
      timer,
      userEmail,
      dictationId,
      note,
    });

    return NextResponse.json(createdScore);
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du score:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'enregistrement du score." },
      { status: 500 },
    );
  }
}
