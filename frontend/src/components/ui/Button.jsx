const variants = {
  primary: 'bg-gradient-to-r from-fitness-red to-fitness-orange text-white hover:opacity-90',
  secondary: 'bg-fitness-gray text-white hover:bg-fitness-gray/80',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  xs: 'px-2 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
}

function Button({ children, variant = 'primary', size = 'md', disabled, className = '', ...props }) {
  return (
    <button
      className={`rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
