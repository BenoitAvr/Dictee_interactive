import { NextResponse } from 'next/server';
import { findHelperWordsWithHelper } from '@/app/lib/data_prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json(
      { error: 'Le paramètre de requête "query" doit être une chaîne.' },
      { status: 400 },
    );
  }

  try {
    const helper = await findHelperWordsWithHelper(query);

    if (!helper) {
      return NextResponse.json({ error: 'Helper non trouvé.' }, { status: 404 });
    }

    return NextResponse.json(helper);
  } catch (error) {
    console.error('Erreur lors de la recherche du Helper:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la recherche du Helper.' },
      { status: 500 },
    );
  }
}
