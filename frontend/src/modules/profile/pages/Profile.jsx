import { useState, useEffect } from 'react'
import { usersAPI, membershipsAPI, plansAPI } from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'
import { Card, CardTitle } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Spinner, PageSpinner } from '../../../components/ui/Spinner'
import Modal from '../../../components/ui/Modal'
import { formatCOP } from '../../../utils/format'

const friendlyDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`
}

const getStatusInfo = (estado, fechaVencimiento) => {
  if (estado === 'activa' && new Date(fechaVencimiento) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
    return { label: 'Proxima a vencer', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' }
  }
  if (estado === 'activa') return { label: 'Activa', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' }
  if (estado === 'vencida') return { label: 'Vencida', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' }
  return { label: estado, color: 'text-fitness-muted', bg: 'bg-fitness-gray border-fitness-gray' }
}

function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({ nombre: '', apellido: '', telefono: '', fechaNacimiento: '', direccion: '', especialidades: '' })

  const [planData, setPlanData] = useState(null)
  const [planLoading, setPlanLoading] = useState(true)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [availablePlans, setAvailablePlans] = useState([])
  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [changingPlan, setChangingPlan] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await usersAPI.getProfile()
        setProfile(data)
        setFormData({
          nombre: data.usuario.nombre || '', apellido: data.usuario.apellido || '',
          telefono: data.perfilExtra?.telefono || '',
          fechaNacimiento: data.perfilExtra?.fechaNacimiento ? new Date(data.perfilExtra.fechaNacimiento).toISOString().split('T')[0] : '',
          direccion: data.perfilExtra?.direccion || '',
          especialidades: data.perfilExtra?.especialidades?.join(', ') || ''
        })
      } catch (err) { setError('Error al cargar perfil') }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  useEffect(() => {
    if (user?.rol?.nombre !== 'Cliente') { setPlanLoading(false); return }
    membershipsAPI.getMyPlanEnhanced()
      .then(({ data }) => setPlanData(data))
      .catch(() => {})
      .finally(() => setPlanLoading(false))
  }, [user])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    try {
      await usersAPI.updateProfile({
        nombre: formData.nombre, apellido: formData.apellido,
        telefono: formData.telefono, fechaNacimiento: formData.fechaNacimiento || undefined,
        direccion: formData.direccion,
        especialidades: formData.especialidades ? formData.especialidades.split(',').map(e => e.trim()) : undefined
      })
      setSuccess('Perfil actualizado correctamente')
    } catch (err) { setError(err.response?.data?.mensaje || 'Error') }
    finally { setSaving(false) }
  }

  const openChangePlan = async () => {
    try {
      const { data } = await plansAPI.getAll()
      setAvailablePlans(data)
      setSelectedPlanId(null)
      setShowPlanModal(true)
    } catch {
      setError('Error al cargar planes')
    }
  }

  const handleChangePlan = async () => {
    if (!selectedPlanId) return
    setChangingPlan(true)
    try {
      await membershipsAPI.changePlan({ planId: selectedPlanId })
      const { data } = await membershipsAPI.getMyPlanEnhanced()
      setPlanData(data)
      setShowPlanModal(false)
      setSuccess('Plan cambiado exitosamente')
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cambiar plan')
    } finally {
      setChangingPlan(false)
    }
  }

  if (loading) return <PageSpinner />

  const esCliente = user?.rol?.nombre === 'Cliente'
  const esEntrenador = user?.rol?.nombre === 'Entrenador'
  const membresia = planData?.membresia
  const planInfo = planData?.planInfo
  const historial = planData?.historial || []
  const status = membresia ? getStatusInfo(membresia.estado, membresia.fechaVencimiento) : null

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
        <p className="text-fitness-muted text-sm mt-1">Administra tu información personal</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">{success}</div>}

      <Card hover={false}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
            <Input label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} required />
          </div>

          <Input label="Correo electrónico" type="email" value={user?.email || ''} disabled />
          <p className="text-xs text-fitness-muted -mt-3 mb-4">El correo no se puede modificar</p>

          {esCliente && (
            <>
              <Input label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+56 9 1234 5678" />
              <Input label="Fecha de nacimiento" name="fechaNacimiento" type="date" value={formData.fechaNacimiento} onChange={handleChange} />
              <Input label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Tu dirección" />
            </>
          )}

          {esEntrenador && (
            <>
              <Input label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+56 9 1234 5678" />
              <Input label="Especialidades" name="especialidades" value={formData.especialidades} onChange={handleChange} placeholder="Yoga, CrossFit, Spinning (separado por comas)" />
            </>
          )}

          <div className="mt-6">
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </Card>

      {esCliente && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Mi Plan</h2>
          {planLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : membresia ? (
            <Card hover={false}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <CardTitle>{planInfo?.nombre || membresia.tipo}</CardTitle>
                  <p className="text-2xl font-bold text-fitness-red mt-1">{formatCOP(membresia.precio)}</p>
                </div>
                {status && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-fitness-muted">Fecha de inicio</p>
                  <p className="text-white font-medium">{friendlyDate(membresia.fechaInicio)}</p>
                </div>
                <div>
                  <p className="text-fitness-muted">Proximo pago</p>
                  <p className="text-white font-medium">{friendlyDate(membresia.fechaVencimiento)}</p>
                </div>
              </div>

              {planInfo?.beneficios?.length > 0 && (
                <div className="mb-4">
                  <p className="text-fitness-muted text-sm mb-2">Beneficios:</p>
                  <ul className="space-y-1">
                    {planInfo.beneficios.map((b, i) => (
                      <li key={i} className="text-white text-sm flex items-start gap-2">
                        <span className="text-fitness-orange">&#10003;</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button onClick={openChangePlan} variant="secondary">
                Cambiar Plan
              </Button>
            </Card>
          ) : (
            <Card hover={false}>
              <p className="text-fitness-muted text-sm">No tienes un plan activo.</p>
              <Button onClick={openChangePlan} className="mt-4">
                Elegir Plan
              </Button>
            </Card>
          )}

          {historial.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-white mb-3">Historial de membresias</h3>
              <div className="space-y-2">
                {historial.map(h => (
                  <div key={h._id} className="bg-fitness-dark border border-fitness-gray rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">{h.planNuevo?.nombre || 'Plan'}</p>
                        <p className="text-fitness-muted text-xs">{formatCOP(h.precio)}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        h.estado === 'activa' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                        h.estado === 'completada' ? 'border-fitness-gray text-fitness-muted' :
                        'border-red-500/30 text-red-400 bg-red-500/10'
                      }`}>{h.estado}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-fitness-muted">
                      <div>Inicio: {friendlyDate(h.fechaInicio)}</div>
                      <div>Fin: {friendlyDate(h.fechaFin)}</div>
                      <div>Cambio: {friendlyDate(h.fechaCambio)}</div>
                    </div>
                    {h.planAnterior && (
                      <p className="text-xs text-fitness-muted mt-1">Plan anterior: {h.planAnterior.nombre}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showPlanModal} onClose={() => setShowPlanModal(false)} title="Cambiar Plan" size="lg">
        {availablePlans.length === 0 ? (
          <p className="text-fitness-muted">No hay planes disponibles</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {availablePlans.map(plan => (
              <button
                key={plan._id}
                type="button"
                onClick={() => setSelectedPlanId(plan._id)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedPlanId === plan._id
                    ? 'border-fitness-red bg-fitness-red/10'
                    : 'border-fitness-gray hover:border-fitness-red/50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-white font-semibold">{plan.nombre}</span>
                  <span className="text-fitness-red font-bold">{formatCOP(plan.precio)}</span>
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
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowPlanModal(false)} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleChangePlan} disabled={!selectedPlanId || changingPlan} className="flex-1">
            {changingPlan ? 'Cambiando...' : 'Confirmar Cambio'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default Profile
