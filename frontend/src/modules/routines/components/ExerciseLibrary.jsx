import { useState, useEffect } from 'react'
import { exercisesAPI } from '../../../services/api'
import { Input, Select } from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'

const MUSCLE_COLORS = {
  chest: 'success', pecho: 'success',
  back: 'info', espalda: 'info',
  shoulders: 'warning', hombros: 'warning',
  'upper arms': 'danger', 'brazos superiores': 'danger',
  'lower arms': 'danger', antebrazos: 'danger',
  'upper legs': 'success', 'piernas superiores': 'success',
  'lower legs': 'success', 'piernas inferiores': 'success',
  waist: 'warning', cintura: 'warning',
  cardio: 'info',
  neck: 'info', cuello: 'info',
}

function ExerciseLibrary({ muscleGroup, onAddExercise, addedIds }) {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [bodyParts, setBodyParts] = useState([])
  const [bodyPart, setBodyPart] = useState(muscleGroup || '')
  const [equipment, setEquipment] = useState('')
  const [equipmentList, setEquipmentList] = useState([])
  const [cursor, setCursor] = useState(null)
  const [nextCursor, setNextCursor] = useState(null)
  const [hasNext, setHasNext] = useState(false)

  useEffect(() => {
    exercisesAPI.getBodyParts().then(({ data }) => setBodyParts(data || [])).catch(() => {})
    exercisesAPI.getEquipment().then(({ data }) => setEquipmentList(data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (muscleGroup) {
      setBodyPart(muscleGroup)
    }
  }, [muscleGroup])

  useEffect(() => {
    fetchExercises(true)
  }, [bodyPart, equipment])

  const fetchExercises = async (reset = false) => {
    setLoading(true)
    const c = reset ? null : cursor
    if (reset) setCursor(null)
    try {
      const params = { limit: 30 }
      if (c) params.cursor = c
      if (bodyPart) params.bodyParts = bodyPart
      if (equipment) params.equipments = equipment
      if (search) params.name = search

      const { data } = await exercisesAPI.getAll(params)
      setExercises(prev => reset ? (data.results || []) : [...prev, ...(data.results || [])])
      setNextCursor(data.nextCursor || null)
      setHasNext(data.hasNextPage || false)
      if (reset) setCursor(null)
      else setCursor(c)
    } catch (err) { }
    finally { setLoading(false) }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchExercises(true)
  }

  const loadMore = () => {
    setCursor(nextCursor)
    fetchExercises(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-fitness-gray space-y-2">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Buscar ejercicios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm"
          />
          <Button type="submit" size="sm">Buscar</Button>
        </form>
        <div className="flex gap-2">
          <Select value={bodyPart} onChange={(e) => setBodyPart(e.target.value)} className="text-sm flex-1">
            <option value="">Todos los grupos</option>
            {bodyParts.map((bp) => (
              <option key={bp.original || bp} value={bp.original || bp}>{bp.traducido || bp.original || bp}</option>
            ))}
          </Select>
          <Select value={equipment} onChange={(e) => setEquipment(e.target.value)} className="text-sm flex-1">
            <option value="">Todo equipo</option>
            {equipmentList.map((eq) => (
              <option key={eq.original || eq} value={eq.original || eq}>{eq.traducido || eq.original || eq}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading && exercises.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-fitness-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : exercises.length === 0 ? (
          <p className="text-center text-fitness-muted text-sm py-8">No se encontraron ejercicios</p>
        ) : (
          exercises.map((ex) => {
            const isAdded = addedIds?.has(ex.exerciseId)
            const bodyPartLabel = ex.bodyParts?.[0] || ''
            const bodyPartKey = (ex.bodyPartsRaw?.[0] || bodyPartLabel).toLowerCase()
            return (
              <div
                key={ex.exerciseId}
                draggable={!isAdded}
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify({
                    exerciseId: ex.exerciseId, nombre: ex.name,
                    gifUrl: ex.gifUrl, bodyPart: bodyPartLabel
                  }))
                }}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-grab active:cursor-grabbing
                  ${isAdded ? 'opacity-40 cursor-not-allowed bg-fitness-gray/20' : 'hover:bg-fitness-gray/50'}`}
              >
                <img
                  src={ex.gifUrl}
                  alt={ex.name}
                  className="w-14 h-14 rounded-lg object-contain bg-fitness-darker shrink-0"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{ex.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge color={MUSCLE_COLORS[bodyPartKey] || 'info'} size="sm">{bodyPartLabel}</Badge>
                    <span className="text-xs text-fitness-muted truncate">{ex.equipments?.[0] || ex.equipmentsRaw?.[0] || ''}</span>
                  </div>
                </div>
                <button
                  onClick={() => !isAdded && onAddExercise(ex)}
                  disabled={isAdded}
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                    ${isAdded
                      ? 'bg-fitness-gray/30 text-fitness-muted cursor-not-allowed'
                      : 'bg-fitness-red/20 text-fitness-red hover:bg-fitness-red/40'}`}
                  title={isAdded ? 'Ya agregado' : 'Agregar'}
                >
                  {isAdded ? '✓' : '+'}
                </button>
              </div>
            )
          })
        )}
        {hasNext && !loading && (
          <div className="text-center pt-2">
            <button onClick={loadMore} className="text-xs text-fitness-red hover:underline">Cargar mas</button>
          </div>
        )}
        {loading && exercises.length > 0 && (
          <div className="flex justify-center py-2">
            <div className="w-5 h-5 border-2 border-fitness-red border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}

export default ExerciseLibrary
