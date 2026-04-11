'use client'
import React from 'react';
import Image from 'next/image';
import { dictation } from '@prisma/client';

interface BestScore {
    id: string;
    dictation: {
        id: string;
        title: string;
        level: string;
    };
    note: string;
    score: number;
    timer: number;
    correct_words: number;
    incorrect_words: number;
    pourcentage: number;
}

interface Props {
    initialDictationData: dictation;
    bestScore?: BestScore;
}

export default function CardDictation({ initialDictationData, bestScore }: Props) {
    const handleStartDictationById = () => {
        window.location.href = `/dictee?id=${initialDictationData.id}`;
    };

    const roundedScore = bestScore?.pourcentage !== undefined
        ? Math.round(bestScore.pourcentage)
        : null;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col w-52">
            <div className="relative w-full h-52 overflow-hidden">

                <Image
                    src={`/dictee_image/${encodeURIComponent(initialDictationData.title)}.jpg`}
                    alt={initialDictationData.title}
                    fill
                    style={{ objectFit: "cover", objectPosition: "center" }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {roundedScore !== null && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold rounded-full px-2 py-1">
                        {roundedScore}%
                    </div>
                )}
            </div>
            <div className="p-3 flex flex-col justify-between flex-grow">
                <div>
                    <h3 className="text-sm font-bold leading-tight mb-1">{initialDictationData.title}</h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2 overflow-hidden">{initialDictationData.excerpt}</p>
                </div>
                <div className="flex justify-between items-center mt-auto">
                    <span className="flex items-center text-xs text-gray-500">
                        <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {initialDictationData.audio_duration_minutes}:{initialDictationData.audio_duration_seconds?.toString().padStart(2, '0')}
                    </span>
                    <button
                        onClick={handleStartDictationById}
                        className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EEE2CB] hover:bg-[#E6D5B8] transition-colors duration-300"
                    >
                        Lancer
                    </button>
                </div>
            </div>
        </div>
    );
}