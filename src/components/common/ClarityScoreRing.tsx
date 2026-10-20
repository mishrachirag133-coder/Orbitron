import React from 'react';

interface ClarityScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showGrade?: boolean;
}

export const ClarityScoreRing: React.FC<ClarityScoreRingProps> = ({
  score,
  size = 180,
  strokeWidth = 14,
  showGrade = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let color = '#10b981'; // emerald
  let gradeText = 'Analysis Ready';
  let gradeBadgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

  if (clampedScore >= 90) {
    color = '#10b981';
    gradeText = 'Pristine Imagery (Tier 1)';
    gradeBadgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  } else if (clampedScore >= 75) {
    color = '#06b6d4'; // cyan
    gradeText = 'Analysis Ready (Tier 2)';
    gradeBadgeColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
  } else if (clampedScore >= 55) {
    color = '#f59e0b'; // amber
    gradeText = 'Moderate Obstruction (Tier 3)';
    gradeBadgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  } else {
    color = '#f43f5e'; // rose
    gradeText = 'Heavy Cloud Veil (Tier 4)';
    gradeBadgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease',
              filter: `drop-shadow(0 0 10px ${color}66)`,
            }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5">
            / 100 Score
          </span>
        </div>
      </div>

      {showGrade && (
        <div className="mt-3 text-center">
          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${gradeBadgeColor}`}>
            {gradeText}
          </span>
        </div>
      )}
    </div>
  );
};
