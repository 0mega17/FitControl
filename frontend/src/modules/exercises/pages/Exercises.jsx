import { useState, useEffect } from 'react'
import { exercisesAPI } from '../../../services/api'
import ExerciseCard from '../../../components/ui/ExerciseCard'
import { Input, Select } from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import { PageSpinner } from '../../../components/ui/Spinner'

const LIMIT = 20

function ExerciseCatalog() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [bodyPart, setBodyPart] = useState('')
  const [targetMuscle, setTargetMuscle] = useState('')
  const [equipment, setEquipment] = useState('')
  const [cursor, setCursor] = useState(null)
  const [nextCursor, setNextCursor] = useState(null)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [bodyParts, setBodyParts] = useState([])
  const [targets, setTargets] = useState([])
  const [equipmentList, setEquipmentList] = useState([])
  const [history, setHistory] = useState([])

  const buildParams = (override = {}) => {
    const p = { limit: LIMIT, ...override }
    if (search) p.name = search
    if (bodyPart) p.bodyParts = bodyPart
    if (targetMuscle) p.targetMuscles = targetMuscle
    if (equipment) p.equipments = equipment
    Object.keys(p).forEach(k => { if (!p[k]) delete p[k] })
    return p
  }

  const fetchExercises = async (params) => {
    setLoading(true)
    try {
      const { data } = await exercisesAPI.getAll(params)
      setExercises(data.results || [])
      setNextCursor(data.nextCursor || null)
      setHasNextPage(data.hasNextPage || false)
    } catch (err) { }
    finally { setLoading(false) }
  }

  const fetchFilters = async () => {
    try {
      const [bp, tm, eq] = await Promise.all([
        exercisesAPI.getBodyParts(),
        exercisesAPI.getTargetMuscles(),
        exercisesAPI.getEquipment()
      ])
      setBodyParts(bp.data || [])
      setTargets(tm.data || [])
      setEquipmentList(eq.data || [])
    } catch (err) { }
  }

  useEffect(() => { fetchFilters(); fetchExercises(buildParams()) }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setHistory([])
    setCursor(null)
    fetchExercises(buildParams())
  }

  const handleFilter = () => {
    setHistory([])
    setCursor(null)
    fetchExercises(buildParams())
  }

  const handleNext = () => {
    if (!nextCursor) return
    setHistory(prev => [...prev, cursor])
    setCursor(nextCursor)
    fetchExercises(buildParams({ cursor: nextCursor }))
  }

  const handlePrev = () => {
    const prev = history[history.length - 1]
    if (prev === undefined && history.length === 0) return
    setHistory(prev => prev.slice(0, -1))
    const prevCursor = history.length > 1 ? history[history.length - 2] : null
    setCursor(prevCursor || null)
    fetchExercises(buildParams({ cursor: prevCursor || undefined }))
  }

  const hasPrevPage = history.length > 0

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Catálogo de Ejercicios</h1>
        <p className="text-fitness-muted text-sm mt-1">Explora +1,500 ejercicios con GIFs desde ExerciseDB</p>
      </div>

      <div className="card-fitness p-4 mb-6 space-y-3">
        <form onSubmit={handleSearch} className="flex gap-3">
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm">Buscar</Button>
        </form>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select value={bodyPart} onChange={(e) => { setBodyPart(e.target.value); setHistory([]); setCursor(null) }}>
            <option value="">Parte del cuerpo</option>
            {bodyParts.map((bp) => (
              <option key={bp.original || bp} value={bp.original || bp}>{bp.traducido || bp.original || bp}</option>
            ))}
          </Select>
          <Select value={targetMuscle} onChange={(e) => { setTargetMuscle(e.target.value); setHistory([]); setCursor(null) }}>
            <option value="">Músculo objetivo</option>
            {targets.map((t) => (
              <option key={t.original || t} value={t.original || t}>{t.traducido || t.original || t}</option>
            ))}
          </Select>
          <Select value={equipment} onChange={(e) => { setEquipment(e.target.value); setHistory([]); setCursor(null) }}>
            <option value="">Equipamiento</option>
            {equipmentList.map((eq) => (
              <option key={eq.original || eq} value={eq.original || eq}>{eq.traducido || eq.original || eq}</option>
            ))}
          </Select>
        </div>
      </div>

      {loading ? (
        <PageSpinner />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {exercises.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <p className="text-fitness-muted text-lg">No se encontraron ejercicios</p>
                <p className="text-fitness-muted text-sm mt-1">Intenta con otros filtros</p>
              </div>
            ) : exercises.map((ex) => (
              <ExerciseCard key={ex.exerciseId} exercise={ex} />
            ))}
          </div>

          <div className="flex justify-center gap-3 mt-8">
            <Button variant="secondary" onClick={handlePrev} disabled={!hasPrevPage}>
              Anterior
            </Button>
            <Button variant="secondary" onClick={handleNext} disabled={!hasNextPage}>
              Siguiente
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default ExerciseCatalog
