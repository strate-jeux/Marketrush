import './Gauge.css'

/** Jauge 0–100 (Santé financière / Indicateur sociétal). */
export default function Gauge({ label, value, color = 'var(--c-cream)' }) {
  const pct = Math.round(value)
  return (
    <div className="gauge">
      <div className="gauge__head">
        <span className="gauge__label">{label}</span>
        <span className="gauge__value">{pct}</span>
      </div>
      <div className="gauge__track">
        <div
          className="gauge__fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}
