import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routineRequestsAPI } from '../../../services/api'
import { useToast } from '../../../context/ToastContext'
import { Input, Select } from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'

const OBJETIVOS = [
  'Ganar masa muscular',
  'Perder peso',
  'Definicion muscular',
  'Aumentar fuerza',
  'Mejorar resistencia',
  'Rehabilitacion',
  'Otro'
]
const EXPERIENCIAS = ['principiante', 'intermedio', 'avanzado']

function RoutineRequestForm() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    edad: '', peso: '', estatura: '',
    experiencia: 'principiante', tiempoEntrenando: '', diasDisponibles: '',
    objetivo: 'Ganar masa muscular', otroObjetivo: '', metaPersonal: ''
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await routineRequestsAPI.create(formData)
      addToast('Solicitud enviada exitosamente', 'success')
      navigate('/my-requests')
    } catch (err) {
      addToast(err.response?.data?.mensaje || 'Error al enviar solicitud', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Solicitar Rutina Personalizada</h1>
        <p className="text-fitness-muted text-sm mt-1">
          Completa tus datos para que un entrenador cree una rutina a tu medida
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-fitness p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Informacion Fisica</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Edad" type="number" min="1" max="120"
              placeholder="Ej: 25"
              value={formData.edad}
              onChange={(e) => handleChange('edad', e.target.value)}
              required
            />
            <Input
              label="Peso actual (kg)" type="number" min="1" max="500" step="0.1"
              placeholder="Ej: 75"
              value={formData.peso}
              onChange={(e) => handleChange('peso', e.target.value)}
              required
            />
            <Input
              label="Estatura (cm)" type="number" min="50" max="300"
              placeholder="Ej: 175"
              value={formData.estatura}
              onChange={(e) => handleChange('estatura', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="card-fitness p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Experiencia</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select label="Nivel" value={formData.experiencia} onChange={(e) => handleChange('experiencia', e.target.value)}>
              {EXPERIENCIAS.map(ex => (
                <option key={ex} value={ex}>{ex.charAt(0).toUpperCase() + ex.slice(1)}</option>
              ))}
            </Select>
            <Input
              label="Tiempo entrenando" placeholder="Ej: 6 meses"
              value={formData.tiempoEntrenando}
              onChange={(e) => handleChange('tiempoEntrenando', e.target.value)}
              required
            />
            <Input
              label="Dias por semana" type="number" min="1" max="7"
              placeholder="Ej: 4"
              value={formData.diasDisponibles}
              onChange={(e) => handleChange('diasDisponibles', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="card-fitness p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Objetivo del Cliente</h2>
          <div className="space-y-4">
            <Select label="Objetivo principal" value={formData.objetivo} onChange={(e) => handleChange('objetivo', e.target.value)}>
              {OBJETIVOS.map(o => <option key={o} value={o}>{o}</option>)}
            </Select>
            {formData.objetivo === 'Otro' && (
              <Input
                label="Describe tu objetivo"
                placeholder="Describe que deseas lograr"
                value={formData.otroObjetivo}
                onChange={(e) => handleChange('otroObjetivo', e.target.value)}
                required
              />
            )}
          </div>
        </div>

        <div className="card-fitness p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Meta Personal</h2>
          <textarea
            placeholder="Explica que deseas lograr, peso objetivo, tiempo estimado y observaciones adicionales..."
            value={formData.metaPersonal}
            onChange={(e) => handleChange('metaPersonal', e.target.value)}
            required
            rows={5}
            className="w-full bg-fitness-dark border border-fitness-gray rounded-lg px-4 py-3 text-white text-sm placeholder-fitness-muted focus:border-fitness-red focus:outline-none resize-none"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default RoutineRequestForm
