import { useState } from 'react'
import { FiChevronUp, FiChevronDown, FiTrash2, FiEdit2 } from 'react-icons/fi'

function RoutineExerciseItem({ exercise, index, onUpdate, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [editing, setEditing] = useState(false)
  const [config, setConfig] = useState({
    series: exercise.series || 4,
    repeticiones: exercise.repeticiones || 12,
    descanso: exercise.descanso || 60,
    observaciones: exercise.observaciones || ''
  })

  const handleSave = () => {
    onUpdate(index, { ...exercise, ...config })
    setEditing(false)
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', index.toString())
        e.dataTransfer.effectAllowed = 'move'
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const from = parseInt(e.dataTransfer.getData('text/plain'))
        if (!isNaN(from) && from !== index) {
          // handled by parent via onReorder
          window.__routineReorder?.(from, index)
        }
      }}
      className="card-fitness group animate-slide-up"
    >
      <div className="flex items-start gap-3 p-3">
        <img
          src={exercise.gifUrl}
          alt={exercise.nombre}
          className="w-16 h-16 rounded-lg object-contain bg-fitness-darker shrink-0"
          onError={(e) => { e.target.style.display = 'none' }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs text-fitness-muted">#{index + 1}</span>
              <h4 className="text-sm font-semibold text-white">{exercise.nombre}</h4>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => onMoveUp(index)} disabled={isFirst}
                className="p-1 rounded text-fitness-muted hover:text-white hover:bg-fitness-gray disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <FiChevronUp size={14} />
              </button>
              <button onClick={() => onMoveDown(index)} disabled={isLast}
                className="p-1 rounded text-fitness-muted hover:text-white hover:bg-fitness-gray disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <FiChevronDown size={14} />
              </button>
              <button onClick={() => { setEditing(!editing); if (editing) handleSave() }}
                className="p-1 rounded text-fitness-muted hover:text-white hover:bg-fitness-gray transition-colors">
                <FiEdit2 size={14} />
              </button>
              <button onClick={() => onRemove(index)}
                className="p-1 rounded text-fitness-muted hover:text-red-400 hover:bg-red-500/10 transition-colors">
                <FiTrash2 size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs text-fitness-muted">
              <span className="text-fitness-red font-medium">{exercise.series || config.series}</span> series
            </span>
            <span className="text-xs text-fitness-muted">
              <span className="text-fitness-red font-medium">{exercise.repeticiones || config.repeticiones}</span> reps
            </span>
            <span className="text-xs text-fitness-muted">
              Descanso: <span className="text-fitness-red font-medium">{exercise.descanso || config.descanso}s</span>
            </span>
          </div>

          {editing && (
            <div className="mt-3 pt-3 border-t border-fitness-gray space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-fitness-muted block mb-1">Series</label>
                  <input
                    type="number" min="1" max="20"
                    value={config.series}
                    onChange={(e) => setConfig({ ...config, series: parseInt(e.target.value) || 1 })}
                    className="w-full bg-fitness-dark border border-fitness-gray rounded px-2 py-1 text-white text-sm focus:border-fitness-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-fitness-muted block mb-1">Reps</label>
                  <input
                    type="number" min="1" max="100"
                    value={config.repeticiones}
                    onChange={(e) => setConfig({ ...config, repeticiones: parseInt(e.target.value) || 1 })}
                    className="w-full bg-fitness-dark border border-fitness-gray rounded px-2 py-1 text-white text-sm focus:border-fitness-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-fitness-muted block mb-1">Descanso (s)</label>
                  <input
                    type="number" min="0" max="600" step="5"
                    value={config.descanso}
                    onChange={(e) => setConfig({ ...config, descanso: parseInt(e.target.value) || 0 })}
                    className="w-full bg-fitness-dark border border-fitness-gray rounded px-2 py-1 text-white text-sm focus:border-fitness-red focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-fitness-muted block mb-1">Observaciones</label>
                <input
                  type="text" placeholder="Ej: aumentar peso progresivamente"
                  value={config.observaciones}
                  onChange={(e) => setConfig({ ...config, observaciones: e.target.value })}
                  className="w-full bg-fitness-dark border border-fitness-gray rounded px-2 py-1 text-white text-sm focus:border-fitness-red focus:outline-none"
                />
              </div>
              <div className="flex justify-end">
                <button onClick={handleSave}
                  className="text-xs bg-fitness-red/20 text-fitness-red px-3 py-1 rounded hover:bg-fitness-red/30 transition-colors">
                  Guardar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RoutineExerciseItem
