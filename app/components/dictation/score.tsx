import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDictationContext } from '@/app/context/DictationContext';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import './score.css';

interface BestScore {
  id: string;
  score: number;
  timer: string;
  pourcentage: number;
  correct_words: number;
  incorrect_words: number;
}

interface TopScore {
  id: string;
  score: number;
  timer: string;
  pourcentage: number;
  correct_words: number;
  incorrect_words: number;
  userId: string;
  'user.id': string;
  'user.name': string;
}

interface ScoreProps {
  dictationName: String;
  dictationId: String;
}

export default function Score({ dictationName, dictationId }: ScoreProps) {
  const { state, setState } = useDictationContext();
  const [pourcentage, setPourcentage] = useState(100);
  const { data: session } = useSession();
  const scoreSubmittedRef = useRef(false);
  const [bestScore, setBestScore] = useState<BestScore | null>(null);
  const [topScores, setTopScores] = useState<TopScore[]>([]);



  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.email) {
        console.log("L'utilisateur n'est pas connecté ou l'adresse e-mail est manquante.");
        return;
      }

      try {
        // Récupérer le meilleur score de l'utilisateur
        const bestScoreResponse = await fetch(`/api/bestScore?email=${encodeURIComponent(session.user.email)}&dictationId=${encodeURIComponent(dictationId.toString())}`);
        if (bestScoreResponse.ok) {
          const bestScoreData: { bestScore: BestScore | null } = await bestScoreResponse.json();
          setBestScore(bestScoreData.bestScore);
        } else {
          console.error('Erreur lors de la récupération du meilleur score');
        }


      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [session?.user?.email, dictationId]);

  useEffect(() => {
    const fetchDataTopScore = async () => {
      try {
        // Récupérer le top 10 du classement
        const topScoresResponse = await fetch(`/api/thisDictationClassement?dictationId=${encodeURIComponent(dictationId.toString())}`);
        if (topScoresResponse.ok) {
          const topScoresData: { topScores: TopScore[] } = await topScoresResponse.json();
          setTopScores(topScoresData.topScores);
        } else {
          console.error('Erreur lors de la récupération du top 10 du classement');
        }
      } catch (error) {
        console.error("erreur lors de la récupération des meilleurs scores catch");
      }
    };
    fetchDataTopScore();
  }, [dictationId]);

  const submitFinalScore = useCallback(async () => {
    if (scoreSubmittedRef.current) return; // Si le score a déjà été soumis, on ne fait rien

    scoreSubmittedRef.current = true; // Marquer le score comme soumis avant la soumission

    const pourcentage = (state.numberCorrect / (state.numberCorrect + state.numberIncorrect)) * 100;
    const scoreData = {
      score: state.score,
      correct_words: state.numberCorrect,
      incorrect_words: state.numberIncorrect,
      pourcentage: pourcentage,
      timer: state.timer,
      userEmail: session?.user?.email,
      dictationId: dictationId,
      note: 20 - state.numberIncorrect,
    };

    console.log('Données envoyées à l\'API :', scoreData);

    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL + '/api/score', scoreData);
      if (response.status === 200) {
        console.log('Score enregistré avec succès');
        // Effectuez les actions nécessaires après l'enregistrement réussi du score
      } else {
        console.error('Erreur lors de l\'enregistrement du score');
        console.error('Réponse de l\'API :', response.data);
        // Gérez les erreurs d'enregistrement du score
      }
    } catch (error) {
      console.error('Erreur lors de la requête à l\'API :', error);
      // Gérez les erreurs de requête à l'API
    }
  }, [state.score, state.numberCorrect, state.numberIncorrect, session?.user?.email, state.timer, dictationId]);

  useEffect(() => {
    if (state.onDictationFinished && !scoreSubmittedRef.current) {
      submitFinalScore();
    }
  }, [state.onDictationFinished, submitFinalScore]);

  return (
    <div className="score-container">
      <h2 className="score-title">Scores - {dictationName}</h2>
      {!session?.user?.email ? (
        <p>Pensez à vous connecter pour sauvegarder vos scores</p>
      ) : null}
      <table className="score-table">
        <thead>
          <tr>
            <th>Rang</th>
            <th>Utilisateur</th>
            <th>Score</th>
            <th>Mots justes</th>
            <th>Mots faux</th>
            <th>Précision</th>
          </tr>
        </thead>
        <tbody>
          <tr className="current-score">
            <td>-</td>
            <td>Score actuel</td>
            <td>{state.score}</td>
            <td className="correct-words">{state.numberCorrect}</td>
            <td className="incorrect-words">{state.numberIncorrect}</td>
            <td>{Math.floor(state.correctPercentage)}%</td>
          </tr>
          {bestScore && (
            <tr className="best-score">
              <td>-</td>
              <td>Mon meilleur score</td>
              <td>{bestScore.score}</td>
              <td className="correct-words">{bestScore.correct_words}</td>
              <td className="incorrect-words">{bestScore.incorrect_words}</td>
              <td>{Math.floor(bestScore.pourcentage)}%</td>
            </tr>
          )}
          {topScores.map((score, index) => (
            <tr key={score.id}>
              <td className="top-score">{index + 1}</td>
              <td className="top-score">{score['user.name'] || 'Anonyme'}</td>
              <td className="top-score">{score.score}</td>
              <td className="top-score correct-words">{score.correct_words}</td>
              <td className="top-score incorrect-words">{score.incorrect_words}</td>
              <td className="top-score">{Math.floor(score.pourcentage)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}