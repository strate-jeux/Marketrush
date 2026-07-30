import './Logo.css'

export default function Logo({ size = 'lg' }) {
  return (
    <img
      className={`logo logo--${size}`}
      src={`${import.meta.env.BASE_URL}assets/logo/market-rush-logo.png`}
      alt="Market Rush"
    />
  )
}
