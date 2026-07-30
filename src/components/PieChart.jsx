import './PieChart.css'

function polarPoint(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarPoint(cx, cy, r, endAngle)
  const end = polarPoint(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
}

/** Camembert des parts de marché — segments + légende. `slices`: [{id,label,couleur,pct}] */
export default function PieChart({ slices, size = 280 }) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2

  let angle = 0
  const segments = slices
    .filter((s) => s.pct > 0.001)
    .map((s) => {
      const start = angle
      const sweep = (s.pct / 100) * 360
      angle += sweep
      return { ...s, path: arcPath(cx, cy, r, start, angle) }
    })

  return (
    <div className="piechart">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="piechart__svg">
        {segments.map((s) => (
          <path key={s.id} d={s.path} fill={s.couleur} className="piechart__slice" />
        ))}
      </svg>
      <ul className="piechart__legend">
        {slices.map((s) => (
          <li key={s.id} className="piechart__legend-item">
            <span className="piechart__swatch" style={{ background: s.couleur }} />
            <span className="piechart__legend-label">{s.label}</span>
            <span className="piechart__legend-pct">{s.pct.toFixed(1)} %</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
