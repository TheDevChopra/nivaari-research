import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

interface PointsCounterProps {
  points: number;
  className?: string;
}

export const PointsCounter: React.FC<PointsCounterProps> = ({ points, className = '' }) => {
  const [displayedPoints, setDisplayedPoints] = useState(points);
  const [showPlusAnimation, setShowPlusAnimation] = useState(false);
  const prevPointsRef = useRef(points);

  useEffect(() => {
    if (points > prevPointsRef.current) {
      // Points increased: trigger +5 animation and update
      setShowPlusAnimation(true);
      const timer = setTimeout(() => {
        setShowPlusAnimation(false);
      }, 1200);

      setDisplayedPoints(points);
      prevPointsRef.current = points;
      return () => clearTimeout(timer);
    } else {
      setDisplayedPoints(points);
      prevPointsRef.current = points;
    }
  }, [points]);

  return (
    <div className={`relative inline-flex items-center select-none ${className}`}>
      {/* Floating +5 badge on score increase */}
      {showPlusAnimation && (
        <span
          className="absolute -top-3.5 -right-1 font-bold text-xs text-olive bg-sage-light/90 px-1.5 py-0.5 rounded-full shadow-sm animate-floatFade pointer-events-none z-20 border border-olive/30"
          aria-hidden="true"
        >
          +5
        </span>
      )}

      {/* Main counter pill */}
      <div
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-beige-light border border-beige-dark/60 text-forest shadow-subtle transition-all duration-300"
        title={`${displayedPoints} Nivaari Research Points earned`}
        aria-live="polite"
      >
        <Sparkles className="w-3.5 h-3.5 text-peach-dark animate-pulse" />
        <span className="font-heading font-bold text-xs tracking-wide">
          {displayedPoints} <span className="text-[10px] text-forest-muted font-medium">PTS</span>
        </span>
      </div>
    </div>
  );
};

