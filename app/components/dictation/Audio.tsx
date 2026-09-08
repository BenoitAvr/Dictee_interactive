import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Settings, ToggleLeft, ToggleRight } from 'lucide-react';
import { useDictationContext } from '@/app/context/DictationContext';
import { dictation } from '@prisma/client';

interface AudioProps {
  dictation: dictation;
  audioIndexParam: number;
}

export default function Audio({ dictation, audioIndexParam }: AudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { state, setState } = useDictationContext();
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isPlaybackRateOpen, setIsPlaybackRateOpen] = useState(false);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const [isProgressChanging, setIsProgressChanging] = useState(false);
  const [duration, setDuration] = useState({ minutes: 0, seconds: 0 });
  const [lastManualIndex, setLastManualIndex] = useState(state.audioIndex);
  const [isAutoModeEnabled, setIsAutoModeEnabled] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioSrc = `${dictation.audio_url}/${dictation.title.replace(/ /g, '_')}_partie_${state.audioIndex}.mp3`;

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleLoadedMetadata = () => {
        const minutes = Math.floor(audio.duration / 60);
        const seconds = Math.floor(audio.duration % 60);
        setDuration({ minutes, seconds });
      };
      const updateProgress = () => {
        setProgress((audio.currentTime / audio.duration) * 100);
      };
      const handleEnded = () => {
        setIsPlaying(false);
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.load();
      setProgress(0);
      if (isAutoModeEnabled && state.audioIndex !== lastManualIndex) {
        audio.play();
        setIsPlaying(true);
      }
    }
  }, [state.audioIndex, lastManualIndex, isAutoModeEnabled]);

  const toggleAutoMode = () => {
    setIsAutoModeEnabled(!isAutoModeEnabled);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioChange = (index: number) => {
    setLastManualIndex(index);
    setState(prevState => ({ ...prevState, audioIndex: index }));
    setProgress(0); // Reset progress when manually changing audio
  };

  const togglePlaybackRate = () => setIsPlaybackRateOpen(!isPlaybackRateOpen);
  const toggleVolume = () => setIsVolumeOpen(!isVolumeOpen);

  const changePlaybackRate = (rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setIsPlaybackRateOpen(false);
    }
  };

  const changeVolume = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (audio) {
      const progressBarWidth = event.currentTarget.offsetWidth;
      const clickX = event.nativeEvent.offsetX;
      const newProgress = (clickX / progressBarWidth) * 100;
      audio.currentTime = (audio.duration * newProgress) / 100;
      setIsProgressChanging(true);
    }
  };

  const handleProgressChangeEnd = () => setIsProgressChanging(false);

  if (!dictation?.audio_url) {
    return <p>Le chemin du fichier audio n est pas disponible.</p>;
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md transition-all duration-300">
      <audio ref={audioRef} src={audioSrc} className="w-full" />
      <div className="flex items-center justify-between mb-2">
        <button
          className="text-green-500 hover:text-green-600 transition-colors focus:outline-none"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause size={28} /> : <Play size={28} />}
        </button>

        <div className="flex-1 mx-4">
          <div className="flex justify-between items-center mb-1 text-sm text-gray-600">
            <span>{state.audioIndex}/{dictation.audio_total_part}</span>
            <span>{duration.minutes}m {duration.seconds}s</span>
          </div>
          <div
            className="h-2 bg-gray-200 rounded-full cursor-pointer"
            onClick={handleProgressClick}
            onMouseUp={handleProgressChangeEnd}
            onMouseLeave={handleProgressChangeEnd}
          >
            <div
              className={`h-full rounded-full ${isProgressChanging ? 'bg-blue-500' : 'bg-green-500'} transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            className="text-gray-600 hover:text-gray-800 transition-colors focus:outline-none"
            onClick={() => handleAudioChange(state.audioIndex - 1)}
            disabled={state.audioIndex === 1}
          >
            <SkipBack size={20} />
          </button>
          <button
            className="text-gray-600 hover:text-gray-800 transition-colors focus:outline-none"
            onClick={() => handleAudioChange(state.audioIndex + 1)}
            disabled={state.audioIndex === dictation.audio_total_part}
          >
            <SkipForward size={20} />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Auto :</span>
          <button
            className={`flex items-center focus:outline-none transition-colors ${isAutoModeEnabled ? 'text-blue-500 hover:text-blue-600' : 'text-gray-400 hover:text-gray-500'
              }`}
            onClick={toggleAutoMode}
            title={isAutoModeEnabled ? "Mode automatique activé" : "Mode automatique désactivé"}
          >
            {isAutoModeEnabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
              onClick={togglePlaybackRate}
            >
              <Settings size={18} />
            </button>
            {isPlaybackRateOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10">
                {[0.5, 1, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => changePlaybackRate(rate)}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
              onClick={toggleVolume}
            >
              {volume === 0 ? <VolumeX size={18} /> : volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />}
            </button>
            {isVolumeOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-6 h-24 bg-white rounded-full shadow-lg z-10 flex items-center justify-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={changeVolume}
                  className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer transform -rotate-90"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}