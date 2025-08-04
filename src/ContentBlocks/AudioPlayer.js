// File: src/AudioPlayer.js

import React, { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { formatTime } from '../Utils/contentUtils'; // This path assumes contentUtils.js is in src/Utils/

const AudioPlayer = ({ src, description, citation }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    return (
        <div className="my-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
            {description && (
                <div className="text-gray-600 italic mb-4 text-sm" dangerouslySetInnerHTML={{ __html: description }} />
            )}

            <div className="bg-white rounded-lg p-4 shadow-sm">
                <audio
                    ref={audioRef}
                    src={src}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                />

                <div className="flex items-center gap-4">
                    <button
                        onClick={togglePlay}
                        className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    <div className="flex-1">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {citation && (
                <div className="bg-white border border-gray-200 p-3 mt-3 rounded-lg text-sm text-gray-600"
                    dangerouslySetInnerHTML={{ __html: citation }} />
            )}
        </div>
    );
};

export default AudioPlayer;