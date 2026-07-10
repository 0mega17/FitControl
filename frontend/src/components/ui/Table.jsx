export function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-fitness-gray">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-xs font-medium text-fitness-muted uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  )
}

export function Td({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-white ${className}`}>
      {children}
    </td>
  )
}
