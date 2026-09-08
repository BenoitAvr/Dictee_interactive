import React from 'react';
import Link from 'next/link';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { LoginButton } from '@/app/components/auth/LoginButton';
import { WordData } from '../../context/DictationContext';
import { getWordStateClassName } from '../../utils/formatUtils';

export interface DictationResultsProps {
  correctPercentage: number;
  numberCorrect: number;
  numberIncorrect: number;
  wordDataArray: WordData[];
  onRestart: () => void;
}

/**
 * Composant pour afficher les résultats de la dictée
 */
const DictationResults: React.FC<DictationResultsProps> = ({
  correctPercentage,
  numberCorrect,
  numberIncorrect,
  wordDataArray,
  onRestart
}) => {
  const { data: session } = useSession();

  /**
   * Affiche les mots de la dictée avec leurs états
   */
  const renderDictationText = () => {
    return wordDataArray.map((wordData, index) => {
      const className = getWordStateClassName(wordData.state);
      return (
        <span key={index} className={className}>
          {wordData.word}
        </span>
      );
    });
  };

  /**
   * Affiche l'option de connexion pour enregistrer le score
   */
  const renderLoginOption = () => {
    if (session) return null;

    return (
      <div className="text-center py-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Connectez-vous pour enregistrer votre score</p>
        <LoginButton />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Résumé des résultats */}
      <div className="bg-white p-4 rounded-lg shadow-sm text-sm flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-semibold">Dictée terminée</span>
          <span className="font-bold text-blue-600">Score : {Math.floor(correctPercentage)}%</span>
          <span className="text-green-600">{numberCorrect} mots justes</span>
          <span className="text-red-600">{numberIncorrect} mots faux</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onRestart}
            className="flex items-center px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
          >
            <RefreshCw size={12} className="mr-1" />
            Recommencer
          </button>
          <Link href="/" className="flex items-center px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition duration-300">
            <ArrowRight size={12} className="mr-1" />
            Nouvelle dictée
          </Link>
        </div>
      </div>

      {/* Texte de la dictée avec correction */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm leading-relaxed">
        {renderDictationText()}
      </div>

      {/* Option de connexion si nécessaire */}
      {renderLoginOption()}
    </div>
  );
};

export default DictationResults;