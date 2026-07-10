export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div
      className={`${sizes[size] || sizes.md} border-2 border-fitness-gray border-t-fitness-red rounded-full animate-spin ${className}`}
    />
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  )
}
