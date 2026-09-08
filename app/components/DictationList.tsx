'use client'
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import StartDictationLevel from './StartDictationLevel';
import CardDictation from './CardDictation';
import { dictation } from '@prisma/client';

interface Props {
    initialDictations: dictation[];
}

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

export default function DictationList({ initialDictations }: Props) {
    const { data: session } = useSession();
    const [activeLevel, setActiveLevel] = useState<string>('');
    const [filteredDictations, setFilteredDictations] = useState<dictation[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [bestScores, setBestScores] = useState<{ [key: string]: BestScore }>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const lastDivRef = useRef(null);
    const [containerHeightClass, setContainerHeightClass] = useState('h-40');

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth >= 1024) {
                setContainerHeightClass(isExpanded ? 'h-[80vh]' : 'h-40');
            } else {
                setContainerHeightClass(isExpanded ? 'h-[80vh]' : 'h-60');
            }
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isExpanded]);

    useEffect(() => {
        if (activeLevel) {
            setFilteredDictations(initialDictations.filter(dictee => dictee.level === activeLevel));
            setIsExpanded(true);
        } else {
            setFilteredDictations(initialDictations);
            setIsExpanded(false);
        }
    }, [activeLevel, initialDictations]);

    useEffect(() => {
        async function fetchBestScores() {
            if (session?.user?.email) {
                try {
                    const response = await fetch(
                        `/api/bestScores?email=${encodeURIComponent(session.user.email)}`,
                        {
                            headers: {
                                Authorization: `Bearer ${session?.accessToken}`
                            }
                        }
                    );
                    if (response.ok) {
                        const data: { bestScores: BestScore[] } = await response.json();
                        const scoresMap = data.bestScores.reduce((acc, score) => {
                            acc[score.dictation.id] = score;
                            return acc;
                        }, {} as { [key: string]: BestScore });
                        setBestScores(scoresMap);
                    }
                } catch (error) {
                    console.error('Erreur lors de la récupération des meilleurs scores', error);
                }
            }
        }
    
        fetchBestScores();
    }, [session]);

    const handleLevelChange = (level: string) => {
        if (level !== activeLevel) {
            setActiveLevel(level);
        } else {
            setActiveLevel('');
        }
    };

    return (
        <div>
            <div ref={lastDivRef}></div>
            <div id="LevelSelector" className="relative flex-grow flex">
                <div
                    ref={containerRef}
                    className={`
                    fixed bottom-0 left-0 w-full
                    transition-all duration-700 ease-in-out
                    shadow-lg rounded-t-2xl flex flex-col bg-[#222B42] overflow-hidden
                    ${containerHeightClass}
                    ${isExpanded ? 'overflow-y-auto' : ''}
                `}
                >
                    <hr className="hidden lg:block absolute inset-0 h-1 my-8 bg-gray-200 border-0 dark:bg-gray-700 z-0" />
                    <div className="w-max mx-auto relative z-10">
                        <p className="font-bold text-white text-xl mt-4 mb-4 text-center bg-[#222B42] px-4">
                            Sélectionner votre niveau
                        </p>
                    </div>
                    <StartDictationLevel onLevelChange={handleLevelChange} />
                    <div className={`mt-4 lg:mt-8 px-4 ${isExpanded ? 'block' : 'hidden'}`}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                                {filteredDictations.map((dictee) => (
                                    <CardDictation
                                        key={dictee.id}
                                        initialDictationData={dictee}
                                        bestScore={bestScores[dictee.id]}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}