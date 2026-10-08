export function BalineseOrnament({ className, opacity = 0.06 }: { className?: string; opacity?: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ opacity }}
    >
      {/* Central lotus/flower motif */}
      <g transform="translate(100 100)">
        {Array.from({ length: 8 }).map((_, i) => (
          <path
            key={i}
            d="M0 -10 C 12 -35, 25 -35, 0 -60 C -25 -35, -12 -35, 0 -10 Z"
            transform={`rotate(${i * 45})`}
            fill="currentColor"
          />
        ))}
        <circle r="6" fill="currentColor" opacity="0.5" />
      </g>
      {/* Outer ring with dots */}
      <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 22.5 * Math.PI) / 180;
        const x = 100 + Math.cos(angle) * 88;
        const y = 100 + Math.sin(angle) * 88;
        return <circle key={i} cx={x} cy={y} r="2.5" fill="currentColor" />;
      })}
    </svg>
  );
}

export function BalineseBorder({ className, opacity = 0.08 }: { className?: string; opacity?: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ opacity }}
    >
      {/* Repeating flame/mountain pattern (meander) */}
      {Array.from({ length: 10 }).map((_, i) => (
        <path
          key={i}
          d={`M${i * 40} 40 L${i * 40} 20 Q${i * 40 + 10} 0 ${i * 40 + 20} 20 Q${i * 40 + 30} 40 ${i * 40 + 40} 20 L${i * 40 + 40} 40 Z`}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

export function BalineseCorner({ className, opacity = 0.07 }: { className?: string; opacity?: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ opacity }}
    >
      {/* Swirl/karang motif for corners */}
      <path
        d="M0 100 L0 50 Q0 30 20 30 Q35 30 35 45 Q35 55 25 55 Q18 55 18 48 M20 30 Q20 10 40 10 Q60 10 60 30 Q60 45 50 45 Q42 45 42 37"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="50" cy="30" r="4" fill="currentColor" />
      <circle cx="20" cy="50" r="3" fill="currentColor" />
      <path d="M0 100 Q15 85 30 100" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
