import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { exercisesAPI } from '../../services/api'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'

const MUSCLE_COLORS = {
  chest: 'success', back: 'info', shoulders: 'warning',
  'upper arms': 'danger', 'lower arms': 'danger',
  'upper legs': 'success', 'lower legs': 'success',
  waist: 'warning', cardio: 'info', neck: 'info',
}

function ExerciseDetail() {
  const { id } = useParams()
  const [exercise, setExercise] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await exercisesAPI.getById(id)
        setExercise(data)
      } catch (err) { }
      finally { setLoading(false) }
    }
    fetch()
  }, [id])

  if (loading) return <PageSpinner />
  if (!exercise) return (
    <div className="text-center py-20">
      <p className="text-fitness-muted text-lg">Ejercicio no encontrado</p>
      <Link to="/exercises" className="text-fitness-red hover:underline mt-2 inline-block">
        Volver al catálogo
      </Link>
    </div>
  )

  const bodyPart = exercise.bodyParts?.[0] || ''
  const targetMuscle = exercise.targetMuscles?.[0] || ''
  const equipment = exercise.equipments?.[0] || ''

  return (
    <div className="animate-fade-in">
      <Link to="/exercises" className="text-fitness-muted hover:text-white text-sm mb-4 inline-block">
        ← Volver al catálogo
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-[45%] shrink-0">
          <div className="gif-glow flex items-center justify-center">
            <img
              src={exercise.gifUrl}
              alt={exercise.name}
              className="w-full max-w-lg mx-auto rounded-2xl gif-fit shadow-2xl"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-5">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{exercise.name}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge color={MUSCLE_COLORS[bodyPart?.toLowerCase()] || 'info'}>
                {bodyPart}
              </Badge>
              <Badge color="info">{targetMuscle}</Badge>
              <Badge color="warning">{equipment}</Badge>
            </div>
          </div>

          {(exercise.targetMuscles?.length > 0 || exercise.secondaryMuscles?.length > 0) && (
            <div className="grid grid-cols-2 gap-3">
              <div className="card-fitness p-3">
                <h3 className="text-xs font-semibold text-white mb-1.5 uppercase tracking-wider">Músculos objetivo</h3>
                <div className="flex flex-wrap gap-1">
                  {exercise.targetMuscles.map((m, i) => (
                    <Badge key={i} color="danger" size="sm">{m}</Badge>
                  ))}
                </div>
              </div>
              <div className="card-fitness p-3">
                <h3 className="text-xs font-semibold text-white mb-1.5 uppercase tracking-wider">Músculos secundarios</h3>
                <div className="flex flex-wrap gap-1">
                  {exercise.secondaryMuscles.map((m, i) => (
                    <Badge key={i} color="info" size="sm">{m}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Instrucciones</h2>
            <ol className="space-y-2.5">
              {(exercise.instructions || ['No hay instrucciones disponibles']).map((step, i) => (
                <li key={i} className="flex gap-3 text-fitness-muted text-sm leading-relaxed">
                  <span className="w-6 h-6 rounded-full bg-fitness-red/20 text-fitness-red text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step.replace(/^Step:\d+\s*/i, '')}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="pt-3">
            <Link to="/exercises">
              <Button variant="secondary">Explorar más ejercicios</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExerciseDetail
