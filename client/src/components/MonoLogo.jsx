export default function MonoLogo({ className = 'w-24 h-24', color = '#12163A' }) {
  return (
    <svg viewBox="0 0 512 512" fill="none" className={className}>
      <path
        d="M 168 384 L 344 384 L 330 190 L 182 190 Z"
        stroke={color}
        strokeWidth="16"
      />
      <path
        d="M 200 190 Q 200 130 256 130 Q 312 130 312 190"
        stroke={color}
        strokeWidth="16"
      />
      <g fill={color}>
        <rect x="234" y="252" width="44" height="52" rx="8" />
        <rect x="242" y="228" width="10" height="24" />
        <rect x="260" y="228" width="10" height="24" />
        <rect x="248" y="290" width="16" height="30" />
      </g>
    </svg>
  );
}

