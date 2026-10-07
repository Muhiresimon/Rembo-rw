const RAY_ANGLES = Array.from({ length: 24 }, (_, index) => index * 15);

/**
 * Flag of Rwanda — accurate construction: blue top half, yellow and green
 * quarter bands, and the 24-ray golden sun set toward the fly side.
 * Drawn as vector so it stays crisp at every size and needs no asset.
 */
export function RwandaFlag({
  className = "",
  title = "Flag of Rwanda",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg viewBox="0 0 90 60" className={className} role="img" aria-label={title} focusable="false">
      <rect width="90" height="30" fill="#00A1DE" />
      <rect y="30" width="90" height="15" fill="#FAD201" />
      <rect y="45" width="90" height="15" fill="#20603D" />
      <g transform="translate(67.5 15)" fill="#FAD201">
        <circle r="4.6" />
        {RAY_ANGLES.map((angle) => (
          <path key={angle} transform={`rotate(${angle})`} d="M -1.9 -3.6 L 1.9 -3.6 L 0 -10.6 Z" />
        ))}
      </g>
    </svg>
  );
}
