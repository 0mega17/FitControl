import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import Button from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { useToast } from '../../../context/ToastContext'
import { plansAPI } from '../../../services/api'
import { Spinner } from '../../../components/ui/Spinner'
import { formatCOP } from '../../../utils/format'

const OBJETIVOS = [
  'Quemar grasa',
  'Ganar masa muscular',
  'Definir',
  'Mantener peso',
  'Mejorar condicion fisica',
  'Aumentar fuerza'
]

const EXPERIENCIAS = [
  'Nunca he entrenado',
  'Menos de 1 mes',
  '1 mes',
  '3 meses',
  '6 meses',
  '1 ano',
  'Mas de 1 ano'
]

const STEPS = [
  { id: 1, title: 'Crear cuenta' },
  { id: 2, title: 'Objetivos fitness' },
  { id: 3, title: 'Informacion personal' },
  { id: 4, title: 'Experiencia' },
  { id: 5, title: 'Seleccionar plan' }
]

const initialData = {
  nombre: '', apellido: '',
  email: '', password: '', confirmPassword: '',
  objetivo: '',
  edad: '', estatura: '', peso: '',
  experiencia: '',
  planId: null
}

function Register() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(initialData)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(false)
  const { register } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (step === 5) {
      setPlansLoading(true)
      plansAPI.getPublic()
        .then(({ data }) => setPlans(data))
        .catch(() => setError('Error al cargar planes'))
        .finally(() => setPlansLoading(false))
    }
  }, [step])

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const validateStep = () => {
    setError('')
    if (step === 1) {
      if (!formData.nombre || !formData.apellido || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Todos los campos son obligatorios'); return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Las contrasenas no coinciden'); return false
      }
      if (formData.password.length < 6) {
        setError('La contrasena debe tener al menos 6 caracteres'); return false
      }
    }
    if (step === 2) {
      if (!formData.objetivo) { setError('Selecciona un objetivo'); return false }
    }
    if (step === 3) {
      if (!formData.edad || !formData.estatura || !formData.peso) {
        setError('Todos los campos son obligatorios'); return false
      }
      if (Number(formData.edad) < 1 || Number(formData.edad) > 120) { setError('Edad invalida'); return false }
      if (Number(formData.estatura) < 50 || Number(formData.estatura) > 250) { setError('Estatura invalida'); return false }
      if (Number(formData.peso) < 10 || Number(formData.peso) > 500) { setError('Peso invalido'); return false }
    }
    if (step === 4) {
      if (!formData.experiencia) { setError('Selecciona tu experiencia'); return false }
    }
    if (step === 5) {
      if (!formData.planId) { setError('Selecciona un plan'); return false }
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return
    setStep(prev => Math.min(prev + 1, STEPS.length))
  }

  const handleBack = () => {
    setError('')
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    setLoading(true)
    setError('')
    try {
      await register({
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password,
        objetivo: formData.objetivo,
        edad: Number(formData.edad),
        estatura: Number(formData.estatura),
        peso: Number(formData.peso),
        experiencia: formData.experiencia,
        planId: formData.planId
      })
      addToast('Cuenta creada exitosamente', 'success')
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  const progressPercent = Math.round(((step - 1) / (STEPS.length - 1)) * 100)

  return (
    <div className="min-h-screen bg-fitness-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-slide-up">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-fitness-red to-fitness-orange rounded-2xl mb-3">
            <span className="text-2xl font-bold text-white">F</span>
          </div>
          <h1 className="text-2xl font-bold text-white">FitControl</h1>
          <p className="text-fitness-muted text-sm mt-1">Crea tu cuenta en unos pasos</p>
        </div>

        <div className="bg-fitness-dark border border-fitness-gray rounded-2xl p-6 shadow-card">
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-fitness-muted font-medium">Paso {step} de {STEPS.length}</span>
              <span className="text-xs text-fitness-muted">{STEPS[step - 1]?.title}</span>
            </div>
            <div className="w-full bg-fitness-gray rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-fitness-red to-fitness-orange transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              {STEPS.map(s => (
                <div
                  key={s.id}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    s.id <= step ? 'bg-fitness-red' : 'bg-fitness-gray'
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
          )}

          {step === 1 && (
            <div className="animate-fade-in space-y-4">
              <p className="text-white text-sm font-medium">Datos de acceso</p>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nombre" placeholder="Tu nombre"
                  value={formData.nombre} onChange={(e) => update('nombre', e.target.value)} required />
                <Input label="Apellido" placeholder="Tu apellido"
                  value={formData.apellido} onChange={(e) => update('apellido', e.target.value)} required />
              </div>
              <Input label="Correo electronico" type="email" placeholder="correo@ejemplo.com"
                value={formData.email} onChange={(e) => update('email', e.target.value)} required />
              <Input label="Contrasena" type="password" placeholder="Minimo 6 caracteres"
                value={formData.password} onChange={(e) => update('password', e.target.value)} required minLength={6} />
              <Input label="Confirmar contrasena" type="password" placeholder="Repite la contrasena"
                value={formData.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required />
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <p className="text-white text-sm font-medium mb-3">Cual es tu objetivo principal?</p>
              <div className="space-y-2">
                {OBJETIVOS.map(o => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => update('objetivo', o)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm ${
                      formData.objetivo === o
                        ? 'border-fitness-red bg-fitness-red/10 text-white'
                        : 'border-fitness-gray text-fitness-muted hover:text-white hover:border-fitness-red/50'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in space-y-4">
              <p className="text-white text-sm font-medium">Tus datos fisicos</p>
              <Input label="Edad" type="number" placeholder="Ej: 25" min={1} max={120}
                value={formData.edad} onChange={(e) => update('edad', e.target.value)} required />
              <Input label="Estatura (cm)" type="number" placeholder="Ej: 175" min={50} max={250}
                value={formData.estatura} onChange={(e) => update('estatura', e.target.value)} required />
              <Input label="Peso actual (kg)" type="number" placeholder="Ej: 70" min={10} max={500}
                value={formData.peso} onChange={(e) => update('peso', e.target.value)} required />
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in">
              <p className="text-white text-sm font-medium mb-3">Cuanto tiempo llevas entrenando?</p>
              <div className="space-y-2">
                {EXPERIENCIAS.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => update('experiencia', e)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm ${
                      formData.experiencia === e
                        ? 'border-fitness-red bg-fitness-red/10 text-white'
                        : 'border-fitness-gray text-fitness-muted hover:text-white hover:border-fitness-red/50'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-fade-in">
              <p className="text-white text-sm font-medium mb-3">Selecciona tu plan de membresia</p>
              {plansLoading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {plans.map(plan => (
                    <button
                      key={plan._id}
                      type="button"
                      onClick={() => update('planId', plan._id)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        formData.planId === plan._id
                          ? 'border-fitness-red bg-fitness-red/10'
                          : 'border-fitness-gray hover:border-fitness-red/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-white font-semibold">{plan.nombre}</span>
                        <span className="text-fitness-red font-bold">{formatCOP(plan.precio)}/mes</span>
                      </div>
                      <p className="text-fitness-muted text-xs mb-2">{plan.descripcion}</p>
                      {plan.beneficios?.length > 0 && (
                        <ul className="space-y-0.5">
                          {plan.beneficios.map((b, i) => (
                            <li key={i} className="text-fitness-muted text-xs flex items-start gap-1.5">
                              <span className="text-fitness-orange mt-0.5">&#10003;</span>
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="text-fitness-muted text-xs mt-2">Duracion: {plan.duracionDias} dias</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <Button variant="secondary" onClick={handleBack} className="flex-1" disabled={loading}>
                Atras
              </Button>
            )}
            {step < STEPS.length ? (
              <Button onClick={handleNext} className={step > 1 ? 'flex-1' : 'w-full'}>
                Siguiente
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            )}
          </div>

          <div className="mt-4 text-center text-sm text-fitness-muted">
            Ya tienes cuenta?{' '}
            <a href="/login" className="text-fitness-red hover:text-fitness-orange transition-colors font-medium">
              Inicia sesion
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
