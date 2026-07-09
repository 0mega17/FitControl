import RoutineExerciseItem from './RoutineExerciseItem'

function RoutineConstructor({ ejercicios, onUpdate, onRemove, onMoveUp, onMoveDown, onReorder }) {
  if (typeof window !== 'undefined') {
    window.__routineReorder = onReorder
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-fitness-gray">
        <h3 className="text-sm font-semibold text-white">Constructor de Rutina</h3>
        <p className="text-xs text-fitness-muted mt-0.5">
          {ejercicios.length === 0
            ? 'Arrastra ejercicios desde la biblioteca'
            : `${ejercicios.length} ejercicio${ejercicios.length !== 1 ? 's' : ''} agregado${ejercicios.length !== 1 ? 's' : ''}`
          }
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto p-2 space-y-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'))
            if (data.exerciseId) {
              onUpdate(-1, data) // signal parent to add
            }
          } catch {}
        }}
      >
        {ejercicios.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-full bg-fitness-gray/30 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-fitness-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-fitness-muted text-sm">Arrastra ejercicios aqui</p>
            <p className="text-fitness-muted text-xs mt-1">o haz clic en el boton + de cada ejercicio</p>
          </div>
        ) : (
          ejercicios.map((ex, i) => (
            <RoutineExerciseItem
              key={`${ex.idExerciseDB || ex.exerciseId}_${i}`}
              exercise={ex}
              index={i}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              isFirst={i === 0}
              isLast={i === ejercicios.length - 1}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default RoutineConstructor
