import React, { useState, useEffect } from 'react';

interface SpinningWheelProps {
  names: string[];
  designatedName: string;
  onSpinComplete: () => void;
}

export const SpinningWheel: React.FC<SpinningWheelProps> = ({ names, designatedName, onSpinComplete }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    if (isSpinning) {
      const designatedIndex = names.indexOf(designatedName);
      const segmentAngle = 360 / names.length;
      // Add extra rotations for spinning effect
      const targetRotation = 360 * 5 + (360 - (designatedIndex * segmentAngle) - segmentAngle / 2);

      const spinDuration = 5000; // 5 seconds
      const startTime = Date.now();

      const spin = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        // Cubic ease-out for smooth deceleration
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        setRotation(targetRotation * easeProgress);

        if (progress < 1) {
          requestAnimationFrame(spin);
        } else {
          setIsSpinning(false);
          onSpinComplete();
        }
      };

      requestAnimationFrame(spin);
    }
  }, [isSpinning, names, designatedName, onSpinComplete]);

  return (
    <div className="relative w-64 h-64 mx-auto">
      <div
        className="absolute inset-0 rounded-full border-4 border-red-600 overflow-hidden"
        style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.1s linear' }}
      >
        {names.map((name, index) => (
          <div
            key={name}
            className="absolute w-full h-full flex items-center justify-center text-xs font-bold text-white"
            style={{
              transform: `rotate(${(index * 360) / names.length}deg)`,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `conic-gradient(from ${(index * 360) / names.length}deg, 
                             ${index % 2 ? '#34D399' : '#10B981'} 0deg, 
                             ${index % 2 ? '#10B981' : '#34D399'} ${360 / names.length}deg)`,
              }}
            ></div>
            <span className="relative z-10 transform -rotate-90 text-center w-full">
              {name}
            </span>
          </div>
        ))}
      </div>
      <div className="absolute top-0 left-1/2 w-0 h-0 -mt-2 -ml-2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-red-600"></div>
      {!isSpinning && (
        <button
          onClick={() => setIsSpinning(true)}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors duration-300"
        >
          Spin
        </button>
      )}
    </div>
  );
};