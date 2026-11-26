/**
 * As duas ondas de aproximação do símbolo GIMO Pay, isoladas como elemento gráfico.
 * Geometria redesenhada a partir do ícone oficial.
 */
export function WavesGlyph({
  className,
  strokeWidth = 5.5,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg viewBox="0 0 26 40" fill="none" className={className} aria-hidden>
      <path
        d="M4.5 12.2A11 11 0 0 1 4.5 27.8"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M10.8 4.2A20 20 0 0 1 10.8 35.8"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
