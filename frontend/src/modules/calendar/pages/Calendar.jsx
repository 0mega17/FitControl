import { useState, useEffect } from 'react'
import Button from '../../components/ui/Button'
import { Input, Select, Textarea } from '../../components/ui/Input'
import { Card, CardTitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { PageSpinner } from '../../components/ui/Spinner'
import { calendarAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

function Calendar() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ titulo: '', clienteId: '', fecha: '', horaInicio: '', horaFin: '', tipo: 'Sesión Personal', notas: '' })
  const { user } = useAuth()

  const fetchEventos = async () => {
    try {
      const { data } = await calendarAPI.getAll({})
      setEventos(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEventos() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await calendarAPI.create({ ...formData, fecha: new Date(formData.fecha) })
      setShowModal(false)
      fetchEventos()
    } catch (err) { setError(err.response?.data?.mensaje || 'Error') }
  }

  const getStatusBadge = (estado) => {
    const map = { pendiente: 'warning', confirmada: 'success', cancelada: 'danger', completada: 'info' }
    return <Badge color={map[estado]}>{estado}</Badge>
  }

  const eventosHoy = eventos.filter(e => new Date(e.fecha).toDateString() === new Date().toDateString())
  const eventosSemana = eventos.filter(e => {
    const dif = (new Date(e.fecha) - new Date()) / (1000 * 60 * 60 * 24)
    return dif > 0 && dif <= 7
  })

  if (loading) return <PageSpinner />

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Calendario de Entrenamiento</h2>
        <Button onClick={() => setShowModal(true)}>+ Nuevo Evento</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardTitle>Eventos de Hoy</CardTitle>
          {eventosHoy.length === 0 ? (
            <p className="text-fitness-muted text-sm">Sin eventos hoy</p>
          ) : (
            eventosHoy.map(e => (
              <div key={e._id} className="border-b border-fitness-gray pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white">{e.titulo}</span>
                  {getStatusBadge(e.estado)}
                </div>
                <p className="text-fitness-muted text-sm">{e.horaInicio} - {e.horaFin} | {e.tipo}</p>
                {e.cliente?.usuario && <p className="text-fitness-muted text-sm">Cliente: {e.cliente.usuario.nombre}</p>}
              </div>
            ))
          )}
        </Card>

        <Card>
          <CardTitle>Próximos 7 días</CardTitle>
          {eventosSemana.length === 0 ? (
            <p className="text-fitness-muted text-sm">Sin eventos próximos</p>
          ) : (
            eventosSemana.map(e => (
              <div key={e._id} className="border-b border-fitness-gray pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white">{e.titulo}</span>
                  {getStatusBadge(e.estado)}
                </div>
                <p className="text-fitness-muted text-sm">{new Date(e.fecha).toLocaleDateString('es-ES')} | {e.horaInicio} - {e.horaFin}</p>
              </div>
            ))
          )}
        </Card>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo Evento">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">{error}</div>
        )}
        <form onSubmit={handleCreate}>
          <Input label="Título" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} required />
          <Select label="Tipo" value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}>
            <option>Sesión Personal</option>
            <option>Clase Grupal</option>
            <option>Evaluación</option>
            <option>Libre</option>
          </Select>
          <Input label="Fecha" type="date" value={formData.fecha} onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Hora Inicio" type="time" value={formData.horaInicio} onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })} required />
            <Input label="Hora Fin" type="time" value={formData.horaFin} onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })} required />
          </div>
          <Input label="ID Cliente (opcional)" value={formData.clienteId} onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })} placeholder="ObjectId del cliente" />
          <Textarea label="Notas" rows={2} value={formData.notas} onChange={(e) => setFormData({ ...formData, notas: e.target.value })} />
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit">Crear Evento</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Calendar
