import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { routinesAPI } from '../../services/api'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'

const NIVEL_COLORS = { principiante: 'success', intermedio: 'warning', avanzado: 'danger' }
const OBJETIVO_LABELS = { hipertrofia: 'Hipertrofia', fuerza: 'Fuerza', resistencia: 'Resistencia', definicion: 'Definicion' }
const MUSCLE_LABELS = {
  chest: 'Pecho', back: 'Espalda', shoulders: 'Hombros',
  'upper arms': 'Brazos', 'lower arms': 'Antebrazos',
  'upper legs': 'Piernas', 'lower legs': 'Gemelos',
  waist: 'Abdomen', cardio: 'Cardio', neck: 'Cuello'
}

function RoutineDetail() {
  const { id } = useParams()
  const [rutina, setRutina] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await routinesAPI.getById(id)
        setRutina(data)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetch()
  }, [id])

  if (loading) return <PageSpinner />
  if (!rutina) return (
    <div className="text-center py-20">
      <p className="text-fitness-muted text-lg">Rutina no encontrada</p>
      <Link to="/routines" className="text-fitness-red hover:underline mt-2 inline-block">Volver</Link>
    </div>
  )

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Link to="/routines" className="text-fitness-muted hover:text-white text-sm mb-4 inline-block">
        ← Volver a rutinas
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{rutina.nombre}</h1>
        {rutina.descripcion && <p className="text-fitness-muted text-sm mt-1">{rutina.descripcion}</p>}
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Badge color={NIVEL_COLORS[rutina.nivel] || 'info'}>{rutina.nivel?.charAt(0).toUpperCase() + rutina.nivel?.slice(1)}</Badge>
          <Badge color="info">{OBJETIVO_LABELS[rutina.objetivo] || rutina.objetivo}</Badge>
          <Badge color="warning">{MUSCLE_LABELS[rutina.grupoMuscularPrincipal] || rutina.grupoMuscularPrincipal}</Badge>
          {rutina.grupoMuscularSecundario && (
            <Badge color="secondary">{MUSCLE_LABELS[rutina.grupoMuscularSecundario] || rutina.grupoMuscularSecundario}</Badge>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {rutina.ejercicios?.map((ex, i) => (
          <div key={`${ex.idExerciseDB}_${i}`} className="card-fitness overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div className="sm:w-56 bg-fitness-darker flex items-center justify-center shrink-0">
                <img src={ex.gifUrl} alt={ex.nombre} className="w-full h-44 sm:h-full object-contain" />
              </div>
              <div className="flex-1 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-fitness-muted">#{i + 1}</span>
                  <h3 className="font-semibold text-white">{ex.nombre}</h3>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="bg-fitness-gray/40 rounded-lg px-3 py-1.5 text-center min-w-[80px]">
                    <p className="text-lg font-bold text-fitness-red">{ex.series}</p>
                    <p className="text-xs text-fitness-muted">Series</p>
                  </div>
                  <div className="bg-fitness-gray/40 rounded-lg px-3 py-1.5 text-center min-w-[80px]">
                    <p className="text-lg font-bold text-fitness-red">{ex.repeticiones}</p>
                    <p className="text-xs text-fitness-muted">Reps</p>
                  </div>
                  <div className="bg-fitness-gray/40 rounded-lg px-3 py-1.5 text-center min-w-[80px]">
                    <p className="text-lg font-bold text-fitness-red">{ex.descanso}s</p>
                    <p className="text-xs text-fitness-muted">Descanso</p>
                  </div>
                </div>

                {ex.observaciones && (
                  <p className="text-sm text-fitness-muted italic border-t border-fitness-gray pt-2">{ex.observaciones}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RoutineDetail
