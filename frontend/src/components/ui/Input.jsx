const baseClasses = 'w-full bg-fitness-gray border border-fitness-gray rounded-lg px-3 py-2 text-sm text-white placeholder-fitness-muted focus:outline-none focus:border-fitness-red transition-colors'

export function Input({ label, id, className = '', ...props }) {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-fitness-muted mb-1">
          {label}
        </label>
      )}
      <input id={id} className={baseClasses} {...props} />
    </div>
  )
}

export function Select({ label, id, children, className = '', ...props }) {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-fitness-muted mb-1">
          {label}
        </label>
      )}
      <select id={id} className={baseClasses} {...props}>
        {children}
      </select>
    </div>
  )
}

export function Textarea({ label, id, className = '', ...props }) {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-fitness-muted mb-1">
          {label}
        </label>
      )}
      <textarea id={id} className={`${baseClasses} resize-vertical min-h-[80px]`} {...props} />
    </div>
  )
}
