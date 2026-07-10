import { useState, useEffect } from 'react'
import { membershipsAPI } from '../../../services/api'
import { formatCOP } from '../../../utils/format'
import { useAuth } from '../../../context/AuthContext'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import Badge from '../../../components/ui/Badge'
import { PageSpinner } from '../../../components/ui/Spinner'
import { Input, Select } from '../../../components/ui/Input'
import { Table, Td } from '../../../components/ui/Table'
import { useToast } from '../../../context/ToastContext'

const TIPOS = ['Diaria', 'Semanal', 'Mensual', 'Trimestral', 'Anual']

function Memberships() {
  const [membresias, setMembresias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPricesModal, setShowPricesModal] = useState(false)
  const [precios, setPrecios] = useState({ Diaria: 10, Semanal: 50, Mensual: 150, Trimestral: 400, Anual: 1200 })
  const [editPrecios, setEditPrecios] = useState({})
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ tipo: 'Mensual', clienteEmail: '', metodoPago: 'Efectivo' })
  const [filtro, setFiltro] = useState('todas')
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuth()
  const { addToast } = useToast()

  const esAdmin = user?.rol?.nombre === 'Administrador'
  const esEntrenador = user?.rol?.nombre === 'Entrenador'

  const fetchMembresias = async () => {
    try {
      const { data } = await membershipsAPI.getSemaforo()
      setMembresias(data)
    } catch (err) { }
    finally { setLoading(false) }
  }

  const fetchPrecios = async () => {
    try {
      const { data } = await membershipsAPI.getPrices()
      setPrecios(data)
      setEditPrecios({ ...data })
    } catch {}
  }

  useEffect(() => { fetchMembresias(); fetchPrecios() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await membershipsAPI.create({ tipo: formData.tipo, clienteEmail: formData.clienteEmail, metodoPago: formData.metodoPago })
      addToast('Membresia creada exitosamente', 'success')
      setShowModal(false)
      fetchMembresias()
    } catch (err) { setError(err.response?.data?.mensaje || 'Error') }
  }

  const handleRenew = async (id) => {
    try {
      await membershipsAPI.renew(id, { metodoPago: 'Efectivo' })
      addToast('Membresia renovada exitosamente', 'success')
      fetchMembresias()
    } catch (err) { addToast(err.response?.data?.mensaje || 'Error al renovar', 'error') }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Seguro que deseas cancelar esta membresia?')) return
    try {
      await membershipsAPI.cancel(id)
      addToast('Membresia cancelada', 'success')
      fetchMembresias()
    } catch (err) { addToast(err.response?.data?.mensaje || 'Error al cancelar', 'error') }
  }

  const handleSavePrices = async (e) => {
    e.preventDefault()
    try {
      await membershipsAPI.updatePrices(editPrecios)
      setPrecios({ ...editPrecios })
      addToast('Precios actualizados', 'success')
      setShowPricesModal(false)
    } catch (err) { addToast(err.response?.data?.mensaje || 'Error al guardar precios', 'error') }
  }

  const formatDate = (date) => new Date(date).toLocaleDateString('es-ES')

  const semaforoColor = (s) => {
    const map = { verde: 'verde', amarillo: 'warning', rojo: 'rojo', gris: 'gris' }
    return map[s] || 'gris'
  }
  const semaforoLabel = (s) => {
    const map = { verde: 'Activa', amarillo: 'Proxima a vencer', rojo: 'Vencida', gris: 'Cancelada' }
    return map[s] || s
  }

  const filtradas = (filtro === 'todas' ? membresias : membresias.filter(m => m.semaforo === filtro))
    .filter(m => {
      if (!searchTerm) return true
      const nombre = `${m.cliente?.usuario?.nombre || ''} ${m.cliente?.usuario?.apellido || ''}`.toLowerCase()
      const email = (m.cliente?.usuario?.email || '').toLowerCase()
      return nombre.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase())
    })

  if (loading) return <PageSpinner />

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion de Membresias</h1>
          <p className="text-fitness-muted text-sm mt-1">Administra las membresias de los clientes</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="input-fitness w-auto text-sm"
          >
            <option value="todas">Todas</option>
            <option value="verde">Activas</option>
            <option value="amarillo">Proximas a vencer</option>
            <option value="rojo">Vencidas</option>
          </select>
          {esAdmin && (
            <Button size="sm" variant="secondary" onClick={() => { fetchPrecios(); setShowPricesModal(true) }}>
              Precios
            </Button>
          )}
          {(esAdmin || esEntrenador) && (
            <Button size="sm" onClick={() => setShowModal(true)}>+ Nueva</Button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex gap-2 mb-4">
        <Badge color="success">Verde: Activa</Badge>
        <Badge color="warning">Amarillo: Proxima a vencer</Badge>
        <Badge color="danger">Rojo: Vencida</Badge>
      </div>

      <Table headers={['Cliente', 'Tipo', 'Inicio', 'Vencimiento', 'Precio', 'Estado', 'Acciones']}>
        {filtradas.length === 0 ? (
          <tr><td colSpan={7} className="px-4 py-8 text-center text-fitness-muted">No hay membresias registradas</td></tr>
        ) : filtradas.map((m) => (
          <tr key={m._id} className="hover:bg-fitness-gray/50 transition-colors">
            <Td>{m.cliente?.usuario?.nombre || 'N/A'} {m.cliente?.usuario?.apellido || ''}</Td>
            <Td><Badge color="info">{m.tipo}</Badge></Td>
            <Td className="text-fitness-muted">{formatDate(m.fechaInicio)}</Td>
            <Td className="text-fitness-muted">{formatDate(m.fechaVencimiento)}</Td>
            <Td className="font-mono">{formatCOP(m.precio)}</Td>
            <Td><Badge color={semaforoColor(m.semaforo)}>{semaforoLabel(m.semaforo)}</Badge></Td>
            <Td>
              {(esAdmin || esEntrenador) && (
                <div className="flex gap-2">
                  {(m.semaforo === 'rojo' || m.semaforo === 'verde') && (
                    <Button size="xs" onClick={() => handleRenew(m._id)}>Renovar</Button>
                  )}
                  {m.semaforo !== 'gris' && (
                    <Button size="xs" variant="danger" onClick={() => handleCancel(m._id)}>Cancelar</Button>
                  )}
                </div>
              )}
            </Td>
          </tr>
        ))}
      </Table>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Membresia">
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
        <form onSubmit={handleCreate}>
          <Input label="Email del Cliente" type="email" placeholder="correo del cliente" value={formData.clienteEmail}
            onChange={(e) => setFormData({ ...formData, clienteEmail: e.target.value })} required />
          <Select label="Tipo de Membresia" value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}>
            {TIPOS.map((t) => <option key={t} value={t}>{t} - {formatCOP(precios[t])}</option>)}
          </Select>
          <Select label="Metodo de Pago" value={formData.metodoPago} onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </Select>
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit">Crear Membresia</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showPricesModal} onClose={() => setShowPricesModal(false)} title="Gestionar Precios">
        <form onSubmit={handleSavePrices}>
          <div className="space-y-4">
            {TIPOS.map((t) => (
              <div key={t}>
                <label className="block text-sm font-medium text-fitness-muted mb-1">{t}</label>
                <Input
                  type="number"
                  min="1"
                  value={editPrecios[t] || ''}
                  onChange={(e) => setEditPrecios({ ...editPrecios, [t]: Number(e.target.value) })}
                  required
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="secondary" onClick={() => setShowPricesModal(false)}>Cancelar</Button>
            <Button type="submit">Guardar Precios</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Memberships
