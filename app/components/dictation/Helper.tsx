import React, { useEffect, useState, useRef } from 'react';
import { useDictationContext } from '@/app/context/DictationContext';
import helperDataJson from '@/app/lib/data/helperData.json';
import wordtoHelper from '@/app/lib/data/wordToHelper.json';

interface Description {
  title?: string;
  type?: string;
  text?: string;
  exemple?: string;
  astuce?: string;
  exemple2?: string;
}

interface HelperData {
  title: string;
  text?: string;
  descriptions?: Description[] | null;
}

interface HelperProps {
  typeError: string;
}

export default function Helper({ typeError }: HelperProps) {
  const { state } = useDictationContext();
  const [helperData, setHelperData] = useState<HelperData | null>(null);
  const [shouldShow, setShouldShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const removePunctuation = (str: string): string => {
    return str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  };

  const hideHelper = () => {
    setShouldShow(false);
    setTimeout(() => {
      setHelperData(null);
    }, 300);
  };

  useEffect(() => {
    // Nettoyer le timeout existant
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Gérer le cas "ongoing"
    if (state.isTyping === true && helperData) {
      timeoutRef.current = setTimeout(hideHelper, 2000);
      return;
    }

    // Gérer le cas "correct"
    else if (state.stateWordInput === 'correct' && helperData) {
          hideHelper();
          return;
        }
    

    // Gérer le cas où on cherche une aide
    else if (typeof state.input === 'string' && 
        state.input && 
        state.typeError === "Word" && 
        state.stateWordInput === "incorrect" && state.isTyping === false) {
      
      const WordGuessPonctuationless = removePunctuation(state.currentWordToGuess.toString());
      const InputPonctuationless = removePunctuation(state.input);

      const lowercaseInput = InputPonctuationless.toLowerCase();
      const lowercaseWordGuess = WordGuessPonctuationless.toLowerCase();
      const longestWord = lowercaseInput.length >= lowercaseWordGuess.length ? lowercaseInput : lowercaseWordGuess;

      const typeAide = Object.entries(wordtoHelper as { [key: string]: string[] })
        .find(([key]) => key.toLowerCase() === longestWord)?.[1];

      if (typeAide) {
        const newData = (helperDataJson as unknown as { [key: string]: HelperData })?.[typeAide[0]];
        if (newData) {
          setHelperData(newData);
          setShouldShow(true);
        }
      } else if (helperData) {
        timeoutRef.current = setTimeout(hideHelper, 2000);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.currentWordToGuess, state.typeError, state.stateWordInput, state.input, helperData, state.isTyping]);

  if (!helperData) {
    return null;
  }

  return (
    <div 
      className={`transition-all duration-300 ease-out ${
        shouldShow ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="helper-bubble bg-white text-gray-800 p-3 rounded-lg shadow-md hover:shadow-lg border border-gray-200 max-w-3xl w-full">
        {helperData.text && (
          <div className="mb-4 pb-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">{helperData.title}</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {helperData.text.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line.startsWith('•') ? (
                    <span className="block ml-4 mt-1">{line}</span>
                  ) : line.startsWith('✓') || line.startsWith('✗') ? (
                    <span className="block mt-1">{line}</span>
                  ) : (
                    <span className="block mt-2 font-medium">{line}</span>
                  )}
                </React.Fragment>
              ))}
            </p>
          </div>
        )}
        {helperData.descriptions && Array.isArray(helperData.descriptions) && (
          <ul className="divide-y divide-gray-200">
            {helperData.descriptions.map((description, index) => (
              <li key={index} className="group py-4 first:pt-0 last:pb-0">
                <div className="flex gap-3">
                  <div className="w-1/6 flex flex-col items-center justify-start pt-1">
                    <h4 className="text-sm font-semibold text-blue-600 mb-1 text-center break-words">{description.title}</h4>
                    {description.type && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 font-medium rounded-full whitespace-normal text-center">
                        {description.type}
                      </span>
                    )}
                  </div>
                  <div className="w-5/6">
                    <p className="text-sm text-gray-700 leading-snug">{description.text}</p>
                    {description.exemple && (
                      <p className="text-xs text-gray-600 italic leading-tight mt-0.5">
                        <span className="font-medium not-italic">Ex :</span> {description.exemple}
                      </p>
                    )}
                    {description.astuce && (
                      <p className="text-xs text-gray-600 leading-tight mt-1">
                        <span className="font-medium">Astuce :</span> {description.astuce}
                      </p>
                    )}
                    {description.exemple2 && (
                      <p className="text-xs text-gray-600 italic leading-tight mt-0.5">
                        <span className="font-medium not-italic">Ex 2 :</span> {description.exemple2}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}