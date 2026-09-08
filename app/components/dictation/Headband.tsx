import React from 'react';
import { Clock, BookOpen, Star } from 'lucide-react';
import { dictation } from '@prisma/client';

interface HeadBandProp {
  dictation: dictation;
  duration: string | null;
}

export default function HeadBand({ dictation, duration }: HeadBandProp) {
  const getLevelConfig = (level: string) => {
    switch (level) {
      case 'Débutant':
        return { bgColor: 'bg-green-100', textColor: 'text-green-800', icon: '🌱' };
      case 'Intermédiaire':
        return { bgColor: 'bg-blue-100', textColor: 'text-blue-800', icon: '🌿' };
      case 'Avancé':
        return { bgColor: 'bg-red-100', textColor: 'text-red-800', icon: '🌳' };
      default:
        return { bgColor: 'bg-gray-100', textColor: 'text-gray-800', icon: '❓' };
    }
  };

  const levelConfig = getLevelConfig(dictation.level);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <BookOpen size={24} className="mr-2 text-blue-600" />
            {dictation.title}
          </h2>
          <p className="text-sm text-gray-600 mt-1 italic">&ldquo;{dictation.excerpt}&rdquo;</p>
        </div>
        <div className="flex flex-col items-end">
          <span className={`${levelConfig.bgColor} ${levelConfig.textColor} text-sm font-semibold px-3 py-1 rounded-full flex items-center mb-2`}>
            {levelConfig.icon} <span className="ml-1">{dictation.level}</span>
          </span>
          <div className="flex items-center text-sm text-gray-500">
            <Clock size={16} className="mr-1" />
            <span>{duration || `${dictation.audio_duration_minutes}:${dictation.audio_duration_seconds?.toString().padStart(2, '0')}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}