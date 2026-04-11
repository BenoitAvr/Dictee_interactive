import { useState, useRef, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { dictation } from '@prisma/client';
import { DictationState, getInitialState } from '../context/DictationContext';
import useScoreCalculation from './useScoreCalculation';
import useTimer from './useTimer';

/**
 * Hook principal pour la gestion de la dictée
 */
export const useDictation = (initialDictationData: dictation) => {
  // État principal de la dictée
  const [state, setState] = useState<DictationState>(
    getInitialState(initialDictationData.text)
  );
  
  // Références et session
  const { data: session } = useSession();
  const scoreSubmittedRef = useRef(false);
  const lastIncorrectWord = useRef<number | undefined>(undefined);
  
  // Hooks personnalisés
  const { calculateScore, calculateScoreBonus } = useScoreCalculation(state.baseScore);
  useTimer(state.timerStarted, setState);
  
  // Liste des mots à deviner
  const listWordToGuess = state.dictationText.split(' ');

  /**
   * Soumet le score final à l'API
   */
  const submitFinalScore = useCallback(async () => {
    if (scoreSubmittedRef.current) return;

    scoreSubmittedRef.current = true;

    const pourcentage = (state.numberCorrect / (state.numberCorrect + state.numberIncorrect)) * 100;
    const scoreData = {
      score: state.score,
      correct_words: state.numberCorrect,
      incorrect_words: state.numberIncorrect,
      pourcentage: pourcentage,
      timer: state.timer,
      userEmail: session?.user?.email,
      dictationId: initialDictationData.id,
      note: 20 - state.numberIncorrect,
    };

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
      const response = await axios.post(`${baseUrl}/api/score`, scoreData);
      if (response.status === 200) {
        console.log('Score enregistré avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la requête à l\'API :', error);
    }
  }, [
    state.score, 
    state.numberCorrect, 
    state.numberIncorrect, 
    state.timer, 
    session?.user?.email, 
    initialDictationData.id
  ]);

  /**
   * Termine la dictée et calcule le score final
   */
  const handleDictationEnd = useCallback((correctPercentage: number, finalScore: number) => {
    const scoreBonusPercentage = calculateScoreBonus(state.timer);
    const augmentedFinalScore = Math.round(state.score * (scoreBonusPercentage / 100 + 1));
    
    setTimeout(() => {
      setState(prevState => ({
        ...prevState,
        scoreBeforeAugmentation: finalScore,
        scoreBonusPercentage: scoreBonusPercentage,
        finalScore: augmentedFinalScore,
        onDictationFinished: true,
        score: augmentedFinalScore,
      }));
    }, 1000);
  }, [state.score, state.timer, calculateScoreBonus]);

  /**
   * Gère le passage au mot suivant
   */
  const handleNextWord = useCallback((paramState: string | null) => {
    let correctWords = state.numberCorrect;
    let incorrectWords = state.numberIncorrect;
    
    // Déterminer si le mot était correct
    if (paramState !== "forced" && paramState !== "incorrect") {
      correctWords += 1;
    }

    const nextWordIndex = state.currentWordIndex + 1;
    const currentWordIndex = state.currentWordIndex;
    
    // Enlever les marqueurs du mot actuel
    const cleanedCurrentWord = listWordToGuess[currentWordIndex].replace(/^#|#$/g, '');

    // Vérifier si le mot actuel termine une phrase (ponctuation)
    const lastChar = state.currentWordToGuess.slice(-1);
    if ([".", "!", "?", ",", ";", ":"].includes(lastChar)) {
      setState(prevState => ({
        ...prevState,
        audioIndex: prevState.audioIndex + 1,
      }));
    }

    // Mettre à jour l'état avec le nouveau mot
    setState(prevState => ({
      ...prevState,
      input: '',
      wordDataArray: [
        ...prevState.wordDataArray,
        { word: cleanedCurrentWord, state: paramState || 'correct' },
      ],
      stateWordInput: "correct",
      currentWordToGuess: listWordToGuess[nextWordIndex],
      numberCorrect: correctWords,
      numberIncorrect: incorrectWords,
      currentWordIndex: nextWordIndex
    }));

    // Vérifier si la dictée est terminée
    if (state.currentWordIndex + 1 === listWordToGuess.length) {
      const { correctPercentage, finalScore } = calculateScore(correctWords, incorrectWords);
      handleDictationEnd(correctPercentage, finalScore);
    }
  }, [
    state.numberCorrect, 
    state.numberIncorrect, 
    state.currentWordIndex,
    state.currentWordToGuess,
    listWordToGuess,
    calculateScore,
    handleDictationEnd
  ]);

  /**
   * Gère une réponse incorrecte
   */
  const handleReponseFalse = useCallback(() => {
    // Vérifier le type d'erreur

    // Erreur de majuscule
    if (state.input.toLowerCase() === listWordToGuess[state.currentWordIndex].toLowerCase()) {
      setState(prevState => ({
        ...prevState,
        stateWordInput: "ErrorMajuscule",
        typeError: "Majuscule"
      }));
      return;
    }

    // Erreur de ponctuation
    const expectedPunctuation = listWordToGuess[state.currentWordIndex].replace(/[.,!?;:]/g, '');
    if (state.input === expectedPunctuation) {
      setState(prevState => ({
        ...prevState,
        stateWordInput: "ErrorPonctuation",
        typeError: "Ponctuation"
      }));
      return;
    }

    // Erreur générale de mot
    const wordIndex = state.currentWordIndex;
    const isNewIncorrectWord = lastIncorrectWord.current !== wordIndex;

    setState(prevState => ({
      ...prevState,
      stateWordInput: "incorrect",
      typeError: "Word",
      isTyping: false,
      numberIncorrect: isNewIncorrectWord ? prevState.numberIncorrect + 1 : prevState.numberIncorrect
    }));

    if (isNewIncorrectWord) {
      lastIncorrectWord.current = state.currentWordIndex;
    }
  }, [state.input, state.currentWordIndex, listWordToGuess]);

  /**
   * Redémarre la dictée
   */
  const handleRestartDictation = useCallback(() => {
    setState(getInitialState(initialDictationData.text));
    scoreSubmittedRef.current = false;
    lastIncorrectWord.current = undefined;
  }, [initialDictationData.text]);

  // Effet pour mettre à jour le score quand le nombre de mots corrects/incorrects change
  useEffect(() => {
    const { correctPercentage, finalScore } = calculateScore(state.numberCorrect, state.numberIncorrect);
    setState(prevState => ({
      ...prevState,
      score: finalScore,
      correctPercentage: correctPercentage
    }));
  }, [state.numberCorrect, state.numberIncorrect, calculateScore]);

  // Effet pour soumettre le score quand la dictée est terminée
  useEffect(() => {
    if (state.onDictationFinished && !scoreSubmittedRef.current) {
      submitFinalScore();
    }
  }, [state.onDictationFinished, submitFinalScore]);

  return {
    state,
    setState,
    handleNextWord,
    handleReponseFalse,
    handleRestartDictation,
    listWordToGuess
  };
};

export default useDictation;