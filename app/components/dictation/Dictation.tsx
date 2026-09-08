'use client';

import React from 'react';
import { dictation } from '@prisma/client';
import { DictationProvider } from '../../context/DictationContext';
import useDictation from '../../hooks/useDictation';
import DictationHeader from './DictationHeader';
import DictationResults from './DictationResults';
import ProgressIndicator from './ProgressIndicator';
import Audio from './Audio';
import GlobalInputComponent from './input/GlobalInputComponent';
import Helper from './Helper';

interface DictationProps {
  initialDictationData: dictation;
}

/**
 * Composant principal de dictée
 */
const Dictation: React.FC<DictationProps> = ({ initialDictationData }) => {
  // Utiliser le hook personnalisé pour toute la logique de dictée
  const {
    state,
    setState,
    handleNextWord,
    handleReponseFalse,
    handleRestartDictation
  } = useDictation(initialDictationData);

  // Créer la valeur du contexte
  const contextValue = {
    state,
    setState,
    handleNextWord,
    handleReponseFalse
  };

  return (
    <DictationProvider value={contextValue}>
      <main className="flex-grow flex flex-col items-center mt-8 px-4 min-h-screen">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            {/* En-tête de la dictée */}
            <DictationHeader dictation={initialDictationData} />

            {/* Contenu principal - soit l'interface de dictée, soit les résultats */}
            {!state.onDictationFinished ? (
              <>
                {/* Zone de saisie */}
                <div className="relative mb-4">
                  <GlobalInputComponent />
                </div>

                {/* Assistant */}
                <div className="absolute">
                  <Helper typeError={state.typeError} />
                </div>

                {/* Lecteur audio */}
                <Audio 
                  dictation={initialDictationData} 
                  audioIndexParam={state.audioIndex} 
                />

                {/* Indicateur de progression */}
                <ProgressIndicator 
                  numberCorrect={state.numberCorrect} 
                  numberIncorrect={state.numberIncorrect} 
                />
              </>
            ) : (
              /* Affichage des résultats */
              <DictationResults
                numberCorrect={state.numberCorrect}
                numberIncorrect={state.numberIncorrect}
                correctPercentage={state.correctPercentage}
                wordDataArray={state.wordDataArray}
                onRestart={handleRestartDictation}
              />
            )}
          </div>
        </div>
      </main>
    </DictationProvider>
  );
};

export default Dictation;