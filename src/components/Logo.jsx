import './Logo.css'

/**
 * Wordmark provisoire en attendant le logo définitif de Kenza (PNG détouré ou SVG,
 * à déposer dans public/assets/logo/ — voir README).
 */
export default function Logo({ size = 'lg' }) {
  return (
    <div className={`logo logo--${size}`}>
      <span className="logo__market">MARKET</span>
      <span className="logo__rush">RUSH</span>
    </div>
  )
}
