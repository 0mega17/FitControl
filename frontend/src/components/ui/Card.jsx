export function Card({ children, hover = true, className = '' }) {
  return (
    <div
      className={`card-fitness p-4 ${hover ? 'hover:border-fitness-red/30 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-white font-semibold text-base mb-2 ${className}`}>
      {children}
    </h3>
  )
}
