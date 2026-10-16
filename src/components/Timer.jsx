import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatTime } from '../utils/quizUtils';

export default function Timer({ initialSeconds, onTimeUp, isActive = true }) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isActive || secondsLeft <= 0) {
      if (secondsLeft <= 0 && isActive) {
        onTimeUp();
      }
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, secondsLeft, onTimeUp]);

  // Color dynamics based on remaining time
  const isDanger = secondsLeft <= 60; // < 1 min
  const isWarning = secondsLeft <= 300 && !isDanger; // < 5 min

  let colorClasses = 'bg-slate-100 text-slate-800 border-slate-300';
  if (isDanger) {
    colorClasses = 'bg-red-50 text-red-700 border-red-300 animate-pulse';
  } else if (isWarning) {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-300';
  } else {
    colorClasses = 'bg-blue-50 text-blue-800 border-blue-200';
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm sm:text-base ${colorClasses}`}>
      {isDanger ? (
        <AlertTriangle className="w-4 h-4 text-red-600 animate-bounce" />
      ) : (
        <Clock className="w-4 h-4" />
      )}
      <span>{formatTime(secondsLeft)}</span>
      <span className="text-xs font-sans font-normal opacity-75">remaining</span>
    </div>
  );
}
