import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { routinesAPI, routineRequestsAPI } from '../../../services/api'
import { useToast } from '../../../context/ToastContext'
import ExerciseLibrary from '../components/ExerciseLibrary'
import RoutineConstructor from '../components/RoutineConstructor'
import { Input, Select } from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'

const NIVELES = ['principiante', 'intermedio', 'avanzado']
const OBJETIVOS = ['hipertrofia', 'fuerza', 'resistencia', 'definicion']

const MUSCLE_MAP = {
  chest: 'Pecho', back: 'Espalda', shoulders: 'Hombros',
  'upper arms': 'Biceps/Triceps', 'lower arms': 'Antebrazos',
  'upper legs': 'Piernas', 'lower legs': 'Gemelos',
  waist: 'Abdomen', cardio: 'Cardio', neck: 'Cuello'
}

function RoutineBuilder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addToast } = useToast()

  const modoPersonal = searchParams.get('modo') === 'personal'
  const clienteNombre = searchParams.get('clienteNombre') || ''
  const requestId = searchParams.get('requestId') || ''
  const clienteId = searchParams.get('clienteId') || ''
  const experienciaPreset = searchParams.get('experiencia') || ''
  const objetivoPreset = searchParams.get('objetivo') || ''

  const [nombre, setNombre] = useState(modoPersonal ? `Rutina para ${clienteNombre}` : '')
  const [descripcion, setDescripcion] = useState('')
  const [nivel, setNivel] = useState(NIVELES.includes(experienciaPreset) ? experienciaPreset : 'principiante')
  const [objetivo, setObjetivo] = useState(
    OBJETIVOS.includes(objetivoPreset.toLowerCase().replace(/\s+/g, ''))
      ? objetivoPreset.toLowerCase().replace(/\s+/g, '')
      : 'hipertrofia'
  )
  const [grupoMuscularPrincipal, setGrupoMuscularPrincipal] = useState('')
  const [grupoMuscularSecundario, setGrupoMuscularSecundario] = useState('')
  const [ejercicios, setEjercicios] = useState([])
  const [saving, setSaving] = useState(false)

  const addedIds = new Set(ejercicios.map(e => e.idExerciseDB || e.exerciseId))

  const handleAddExercise = (ex) => {
    const id = ex.exerciseId
    if (addedIds.has(id)) return
    setEjercicios(prev => [...prev, {
      idExerciseDB: id,
      nombre: ex.name,
      gifUrl: ex.gifUrl,
      series: 4,
      repeticiones: 12,
      descanso: 60,
      observaciones: ''
    }])
  }

  const handleUpdateExercise = (index, updated) => {
    if (index === -1) return
    setEjercicios(prev => prev.map((ex, i) => i === index ? updated : ex))
  }

  const handleRemoveExercise = (index) => {
    setEjercicios(prev => prev.filter((_, i) => i !== index))
  }

  const handleMoveUp = (index) => {
    if (index === 0) return
    setEjercicios(prev => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
      return arr
    })
  }

  const handleMoveDown = (index) => {
    if (index === ejercicios.length - 1) return
    setEjercicios(prev => {
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
      return arr
    })
  }

  const handleReorder = (from, to) => {
    setEjercicios(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr
    })
  }

  const handleSave = async () => {
    if (!nombre.trim()) { addToast('El nombre es obligatorio', 'error'); return }
    if (!grupoMuscularPrincipal) { addToast('Selecciona un grupo muscular principal', 'error'); return }
    if (ejercicios.length === 0) { addToast('Agrega al menos un ejercicio', 'error'); return }

    setSaving(true)
    try {
      const { data: rutina } = await routinesAPI.create({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        nivel, objetivo,
        grupoMuscularPrincipal,
        grupoMuscularSecundario: grupoMuscularSecundario || undefined,
        ejercicios: ejercicios.map((ex, i) => ({ ...ex, orden: i })),
        esPlantilla: !modoPersonal
      })

      if (modoPersonal && requestId && clienteId) {
        await routineRequestsAPI.assignRoutine(requestId, rutina._id)
        addToast('Rutina personalizada asignada exitosamente', 'success')
        navigate('/trainer-requests')
      } else {
        navigate('/routines')
        addToast('Rutina guardada exitosamente', 'success')
      }
    } catch (err) {
      addToast(err.response?.data?.mensaje || 'Error al guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {modoPersonal ? 'Rutina Personalizada' : 'Constructor de Rutinas'}
          </h1>
          <p className="text-fitness-muted text-sm mt-1">
            {modoPersonal ? `Creando rutina para ${clienteNombre}` : 'Crea rutinas profesionales usando ExerciseDB'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(modoPersonal ? '/trainer-requests' : '/routines')}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : modoPersonal ? 'Asignar Rutina' : 'Guardar Rutina'}
          </Button>
        </div>
      </div>

      {modoPersonal && (
        <div className="mb-4 p-3 bg-fitness-red/10 border border-fitness-red/30 rounded-lg shrink-0">
          <p className="text-sm text-fitness-muted">
            <span className="text-white font-medium">Cliente:</span> {clienteNombre}
            {experienciaPreset && <span className="ml-3"><span className="text-white font-medium">Experiencia:</span> <span className="capitalize">{experienciaPreset}</span></span>}
            {objetivoPreset && <span className="ml-3"><span className="text-white font-medium">Objetivo:</span> {objetivoPreset}</span>}
          </p>
        </div>
      )}

      <div className="card-fitness p-4 mb-4 shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Input label="Nombre de la rutina" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Pecho Principiante" />
          <Input label="Descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Breve descripcion" />
          <Select label="Nivel" value={nivel} onChange={(e) => setNivel(e.target.value)}>
            {NIVELES.map(n => <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>)}
          </Select>
          <Select label="Objetivo" value={objetivo} onChange={(e) => setObjetivo(e.target.value)}>
            {OBJETIVOS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
          </Select>
          <Select label="Musculo principal" value={grupoMuscularPrincipal} onChange={(e) => setGrupoMuscularPrincipal(e.target.value)}>
            <option value="">Seleccionar</option>
            {Object.entries(MUSCLE_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Select label="Musculo secundario" value={grupoMuscularSecundario} onChange={(e) => setGrupoMuscularSecundario(e.target.value)}>
            <option value="">Opcional</option>
            {Object.entries(MUSCLE_MAP).filter(([k]) => k !== grupoMuscularPrincipal).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        <div className="card-fitness overflow-hidden flex flex-col">
          <ExerciseLibrary
            muscleGroup={grupoMuscularPrincipal}
            onAddExercise={handleAddExercise}
            addedIds={addedIds}
          />
        </div>

        <div className="card-fitness overflow-hidden flex flex-col">
          <RoutineConstructor
            ejercicios={ejercicios}
            onUpdate={handleUpdateExercise}
            onRemove={handleRemoveExercise}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onReorder={handleReorder}
          />
        </div>
      </div>
    </div>
  )
}

export default RoutineBuilder
