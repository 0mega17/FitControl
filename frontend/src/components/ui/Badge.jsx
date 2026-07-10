const colorMap = {
  success: 'bg-green-500/10 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  danger: 'bg-red-500/10 text-red-400 border-red-500/30',
  error: 'bg-red-500/10 text-red-400 border-red-500/30',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  verde: 'bg-green-500/10 text-green-400 border-green-500/30',
  rojo: 'bg-red-500/10 text-red-400 border-red-500/30',
  gris: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  red: 'bg-red-500/10 text-red-400 border-red-500/30',
}

function Badge({ children, color = 'info', size = 'sm' }) {
  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'
  return (
    <span className={`inline-block rounded-md border font-medium ${colorMap[color] || colorMap.info} ${sizeClasses}`}>
      {children}
    </span>
  )
}

export default Badge
