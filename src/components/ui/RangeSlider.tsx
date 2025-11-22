import React, { useRef, useEffect, useState } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  label?: string;
  formatValue?: (value: number) => string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  label,
  formatValue = (v) => v.toString(),
}) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (handle: 'min' | 'max') => {
    setIsDragging(handle);
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newValue = Math.round(min + percentage * (max - min));

    if (isDragging === 'min') {
      onChange([Math.min(newValue, value[1]), value[1]]);
    } else {
      onChange([value[0], Math.max(newValue, value[0])]);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !trackRef.current) return;

    const touch = e.touches[0];
    const rect = trackRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    const newValue = Math.round(min + percentage * (max - min));

    if (isDragging === 'min') {
      onChange([Math.min(newValue, value[1]), value[1]]);
    } else {
      onChange([value[0], Math.max(newValue, value[0])]);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, value]);

  const minPercent = ((value[0] - min) / (max - min)) * 100;
  const maxPercent = ((value[1] - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}: {formatValue(value[0])} - {formatValue(value[1])}
        </label>
      )}
      <div className="relative pt-6 pb-2">
        {/* Track */}
        <div
          ref={trackRef}
          className="relative h-2 bg-neutral-200 rounded-full cursor-pointer"
        >
          {/* Active Range */}
          <div
            className="absolute h-2 bg-primary-600 rounded-full"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />

          {/* Min Handle */}
          <div
            className={`absolute w-5 h-5 bg-white border-2 border-primary-600 rounded-full cursor-pointer transform -translate-y-1/2 -translate-x-1/2 top-1/2 transition-shadow ${
              isDragging === 'min' ? 'shadow-lg scale-110' : 'hover:shadow-md'
            }`}
            style={{ left: `${minPercent}%` }}
            onMouseDown={() => handleMouseDown('min')}
            onTouchStart={() => handleMouseDown('min')}
          >
            {/* Value Label */}
            <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {formatValue(value[0])}
            </div>
          </div>

          {/* Max Handle */}
          <div
            className={`absolute w-5 h-5 bg-white border-2 border-primary-600 rounded-full cursor-pointer transform -translate-y-1/2 -translate-x-1/2 top-1/2 transition-shadow ${
              isDragging === 'max' ? 'shadow-lg scale-110' : 'hover:shadow-md'
            }`}
            style={{ left: `${maxPercent}%` }}
            onMouseDown={() => handleMouseDown('max')}
            onTouchStart={() => handleMouseDown('max')}
          >
            {/* Value Label */}
            <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {formatValue(value[1])}
            </div>
          </div>
        </div>

        {/* Min/Max Labels */}
        <div className="flex justify-between text-xs text-neutral-500 mt-1">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      </div>
    </div>
  );
};

