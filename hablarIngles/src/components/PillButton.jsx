export default function PillButton({ active, children, ...props }) {
  return (
    <button type="button" className={`pill-button${active ? ' is-active' : ''}`} {...props}>
      {children}
    </button>
  )
}