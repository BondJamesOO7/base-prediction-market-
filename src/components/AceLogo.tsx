export function AceLogo({ className = 'size-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 111 111"
      fill="none"
      xmlns="http://w3.org"
      className={className}
      aria-label="Ace Prediction Market logo"
    >
      <defs>
        <linearGradient id="aceBg" x1="16" y1="10" x2="96" y2="102" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1A6BFF" />
          <stop offset="100%" stopColor="#0044CC" />
        </linearGradient>
        <radialGradient id="aceGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(55.5 31) scale(16)">
          <stop offset="0%" stopColor="#7CF6FF" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#38BDF8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Fundo quadrado arredondado */}
      <rect width="111" height="111" rx="26" fill="url(#aceBg)" />

      {/* Perna esquerda entrelaçada do A */}
      <path
        d="M55.5 31L27 82H43L62 47.5L55.5 31Z"
        fill="white"
      />

      {/* Perna direita entrelaçada do A */}
      <path
        d="M55.5 31L84 82H68L49 47.5L55.5 31Z"
        fill="white"
        fillOpacity="0.9"
      />

      {/* Recorte interno formando o vértice inferior do A */}
      <path
        d="M55.5 58L44 78.5H67L55.5 58Z"
        fill="url(#aceBg)"
      />

      {/* Brilho e ponto de precisão no topo */}
      <circle cx="55.5" cy="31" r="16" fill="url(#aceGlow)" />
      <circle cx="55.5" cy="31" r="4.5" fill="#E0FFFF" />
    </svg>
  )
}
