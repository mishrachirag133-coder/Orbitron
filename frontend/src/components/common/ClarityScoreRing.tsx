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
  strokeWidth = 12,
  showGrade = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let color = '#10b981'; // emerald
  let gradeText = 'Analysis Ready';
  let gradeBadgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

  if (clampedScore >= 90) {
    color = '#10b981';
    gradeText = 'Pristine Imagery (Tier 1)';
    gradeBadgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (clampedScore >= 75) {
    color = '#0284c7'; // sky
    gradeText = 'Analysis Ready (Tier 2)';
    gradeBadgeColor = 'text-sky-700 bg-sky-50 border-sky-200';
  } else if (clampedScore >= 55) {
    color = '#f59e0b'; // amber
    gradeText = 'Moderate Clouds (Tier 3)';
    gradeBadgeColor = 'text-amber-800 bg-amber-50 border-amber-200';
  } else {
    color = '#e11d48'; // rose
    gradeText = 'Heavy Cloud Veil (Tier 4)';
    gradeBadgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
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
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle (Clean without neon glow) */}
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
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease',
            }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mt-0.5">
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
