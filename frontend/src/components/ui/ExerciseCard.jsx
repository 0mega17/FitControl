import { useNavigate } from 'react-router-dom'
import Badge from './Badge'

function ExerciseCard({ exercise }) {
  const navigate = useNavigate()

  const muscleLabel = (muscle) => {
    const labels = {
      chest: 'Pecho', back: 'Espalda', shoulders: 'Hombros',
      'upper arms': 'Brazos', 'lower arms': 'Antebrazos',
      'upper legs': 'Piernas', 'lower legs': 'Gemelos',
      waist: 'Abdomen', cardio: 'Cardio', neck: 'Cuello'
    }
    return labels[muscle] || muscle
  }

  return (
    <div
      onClick={() => navigate(`/exercises/${exercise._id || exercise.id}`)}
      className="card-fitness overflow-hidden cursor-pointer hover:border-fitness-red/30 transition-all"
    >
      {exercise.gifUrl && (
        <div className="bg-fitness-darker flex items-center justify-center h-40">
          <img src={exercise.gifUrl} alt={exercise.name || exercise.nombre} className="h-full object-contain" />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm truncate">{exercise.name || exercise.nombre}</h3>
        <p className="text-xs text-fitness-muted mt-1 capitalize">{exercise.bodyPart || exercise.grupoMuscular}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {exercise.muscle && <Badge color="info" size="sm">{muscleLabel(exercise.muscle)}</Badge>}
          {exercise.equipment && exercise.equipment !== 'body weight' && (
            <Badge color="warning" size="sm">{exercise.equipment}</Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExerciseCard
