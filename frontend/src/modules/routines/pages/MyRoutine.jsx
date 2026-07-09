import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { routinesAPI, membershipsAPI } from '../../services/api'
import { PageSpinner } from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

const NIVEL_COLORS = { principiante: 'success', intermedio: 'warning', avanzado: 'danger' }
const OBJETIVO_LABELS = { hipertrofia: 'Hipertrofia', fuerza: 'Fuerza', resistencia: 'Resistencia', definicion: 'Definicion' }
const MUSCLE_LABELS = {
  chest: 'Pecho', back: 'Espalda', shoulders: 'Hombros',
  'upper arms': 'Brazos', 'lower arms': 'Antebrazos',
  'upper legs': 'Piernas', 'lower legs': 'Gemelos',
  waist: 'Abdomen', cardio: 'Cardio', neck: 'Cuello'
}

function MyRoutine() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState(null)
  const navigate = useNavigate()
  const puedeSolicitar = plan === 'Estandar' || plan === 'Premium'

  useEffect(() => {
    const fetch = async () => {
      try {
        const [routineRes, planRes] = await Promise.all([
          routinesAPI.getMyRoutine(),
          membershipsAPI.getMyPlan().catch(() => null)
        ])
        setData(routineRes.data)
        if (planRes?.data) setPlan(planRes.data.plan)
      } catch (err) { }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  if (loading) return <PageSpinner />

  if (!data) {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Mi Rutina</h1>
          </div>
          {puedeSolicitar && (
            <Button onClick={() => navigate('/solicitar-rutina')}>
              Solicitar Rutina Personalizada
            </Button>
          )}
        </div>
        <div className="text-center py-16">
          <p className="text-fitness-muted text-lg">No tienes una rutina asignada</p>
          <p className="text-fitness-muted text-sm mt-1">Contacta a tu entrenador para que te asigne una</p>
        </div>
      </div>
    )
  }

  const rutina = data.rutina

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{rutina.nombre}</h1>
          <p className="text-fitness-muted text-sm mt-1">{rutina.descripcion}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Badge color={NIVEL_COLORS[rutina.nivel] || 'info'} size="sm">
              {rutina.nivel?.charAt(0).toUpperCase() + rutina.nivel?.slice(1)}
            </Badge>
            <Badge color="info" size="sm">{OBJETIVO_LABELS[rutina.objetivo] || rutina.objetivo}</Badge>
            <Badge color="warning" size="sm">{MUSCLE_LABELS[rutina.grupoMuscularPrincipal] || rutina.grupoMuscularPrincipal}</Badge>
          </div>
        </div>
        {puedeSolicitar && (
          <Button onClick={() => navigate('/solicitar-rutina')} size="sm">
            Solicitar Rutina Personalizada
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {rutina.ejercicios?.map((ex, i) => (
          <div key={`${ex.idExerciseDB}_${i}`} className="card-fitness overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div className="sm:w-48 bg-fitness-darker flex items-center justify-center shrink-0">
                {ex.gifUrl ? (
                  <img src={ex.gifUrl} alt={ex.nombre} className="w-full h-40 sm:h-full object-contain" />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center text-fitness-muted text-sm">Sin GIF</div>
                )}
              </div>
              <div className="flex-1 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-fitness-muted">#{i + 1}</span>
                  <h3 className="font-semibold text-white">{ex.nombre}</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-fitness-gray/40 rounded-lg px-3 py-1.5 text-center min-w-[70px]">
                    <p className="text-lg font-bold text-fitness-red">{ex.series}</p>
                    <p className="text-xs text-fitness-muted">Series</p>
                  </div>
                  <div className="bg-fitness-gray/40 rounded-lg px-3 py-1.5 text-center min-w-[70px]">
                    <p className="text-lg font-bold text-fitness-red">{ex.repeticiones}</p>
                    <p className="text-xs text-fitness-muted">Reps</p>
                  </div>
                  <div className="bg-fitness-gray/40 rounded-lg px-3 py-1.5 text-center min-w-[70px]">
                    <p className="text-lg font-bold text-fitness-red">{ex.descanso}s</p>
                    <p className="text-xs text-fitness-muted">Descanso</p>
                  </div>
                </div>
                {ex.observaciones && (
                  <p className="text-xs text-fitness-muted italic">{ex.observaciones}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 card-fitness">
        <p className="text-xs text-fitness-muted">
          Rutina creada por: <span className="text-white">{rutina.creadoPor?.nombre} {rutina.creadoPor?.apellido}</span>
        </p>
      </div>
    </div>
  )
}

export default MyRoutine
