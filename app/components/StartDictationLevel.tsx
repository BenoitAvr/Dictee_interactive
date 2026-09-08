'use client';

import { useState } from 'react';

interface StartDictationLevelProps {
  onLevelChange: (level: string) => void;
}

export default function StartDictationLevel({ onLevelChange }: StartDictationLevelProps) {
  const [activeLevel, setActiveLevel] = useState<string>('');

  const handleLevelClick = (level: string) => {
    if (activeLevel === level) {
      setActiveLevel('');
      onLevelChange(''); // Deselect level
    } else {
      setActiveLevel(level);
      onLevelChange(level);
    }
  };

  const getButtonClasses = (level: string) => {
    const baseClasses = "w-80 text-base font-semibold py-2 px-16 rounded-full";
    const activeClasses = "bg-[#EEE2CB]";
    const inactiveClasses = "bg-[#BDB3A1]";
    let textColor = "";
    let backgroundColor = inactiveClasses;

    if (activeLevel === level) {
      backgroundColor = activeClasses;
      switch (level) {
        case 'Débutant':
          textColor = "text-[#467143]";
          break;
        case 'Intermédiaire':
          textColor = "text-[#1661A6]";
          break;
        case 'Avancé':
          textColor = "text-[#932929]";
          break;
        default:
          break;
      }
    } else {
      switch (level) {
        case 'Débutant':
          textColor = "text-[#467143]";
          break;
        case 'Intermédiaire':
          textColor = "text-[#1661A6]";
          break;
        case 'Avancé':
          textColor = "text-[#932929]";
          break;
        default:
          break;
      }
    }

    return `${baseClasses} ${textColor} ${backgroundColor}`;
  };

  return (
    <div className="flex h-30 justify-center items-center gap-x-3 gap-y-2 lg:gap-x-16 flex-wrap px-4 pb-6">
      <button
        onClick={() => handleLevelClick('Débutant')}
        className={getButtonClasses('Débutant')}
      >
        Débutant
      </button>
      <button
        onClick={() => handleLevelClick('Intermédiaire')}
        className={getButtonClasses('Intermédiaire')}
      >
        Intermédiaire
      </button>
      <button
        onClick={() => handleLevelClick('Avancé')}
        className={getButtonClasses('Avancé')}
      >
        Avancé
      </button>
    </div>
  );
}
