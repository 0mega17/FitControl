import { useState, useEffect } from 'react'
import { progressAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Card, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { Table, Td } from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'

function Progress() {
  const [progresos, setProgresos] = useState([])
  const [ultimo, setUltimo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ peso: '', altura: '', porcentajeGrasa: '', medidas: { brazo: '', pierna: '', cintura: '', pecho: '' }, observaciones: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { user } = useAuth()

  const esCliente = user?.rol?.nombre === 'Cliente'

  useEffect(() => {
    const fetch = async () => {
      try {
        const [progRes, lastRes] = await Promise.all([progressAPI.getAll(), progressAPI.getLast()])
        setProgresos(progRes.data)
        setUltimo(lastRes.data)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const payload = {
        peso: formData.peso ? Number(formData.peso) : undefined,
        altura: formData.altura ? Number(formData.altura) : undefined,
        porcentajeGrasa: formData.porcentajeGrasa ? Number(formData.porcentajeGrasa) : undefined,
        medidas: {
          brazo: formData.medidas.brazo ? Number(formData.medidas.brazo) : undefined,
          pierna: formData.medidas.pierna ? Number(formData.medidas.pierna) : undefined,
          cintura: formData.medidas.cintura ? Number(formData.medidas.cintura) : undefined,
          pecho: formData.medidas.pecho ? Number(formData.medidas.pecho) : undefined
        },
        observaciones: formData.observaciones
      }
      await progressAPI.create(payload)
      setSuccess('Progreso registrado')
      const [progRes, lastRes] = await Promise.all([progressAPI.getAll(), progressAPI.getLast()])
      setProgresos(progRes.data)
      setUltimo(lastRes.data)
    } catch (err) { setError(err.response?.data?.mensaje || 'Error al registrar') }
  }

  if (loading) return <PageSpinner />

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Registro de Progreso Físico</h1>
        <p className="text-fitness-muted text-sm mt-1">Controla y da seguimiento a tu evolución física</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <Card hover={false}>
            <CardTitle>Registrar Nuevo Progreso</CardTitle>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-3 gap-2">
                <Input label="Peso (kg)" type="number" step="0.1" value={formData.peso} onChange={(e) => setFormData({ ...formData, peso: e.target.value })} />
                <Input label="Altura (cm)" type="number" step="0.1" value={formData.altura} onChange={(e) => setFormData({ ...formData, altura: e.target.value })} />
                <Input label="% Grasa" type="number" step="0.1" value={formData.porcentajeGrasa} onChange={(e) => setFormData({ ...formData, porcentajeGrasa: e.target.value })} />
              </div>
              <p className="text-sm font-medium text-fitness-muted mb-1.5">Medidas (cm)</p>
              <div className="grid grid-cols-2 gap-2">
                <Input label="Brazo" type="number" step="0.1" value={formData.medidas.brazo} onChange={(e) => setFormData({ ...formData, medidas: { ...formData.medidas, brazo: e.target.value } })} />
                <Input label="Pierna" type="number" step="0.1" value={formData.medidas.pierna} onChange={(e) => setFormData({ ...formData, medidas: { ...formData.medidas, pierna: e.target.value } })} />
                <Input label="Cintura" type="number" step="0.1" value={formData.medidas.cintura} onChange={(e) => setFormData({ ...formData, medidas: { ...formData.medidas, cintura: e.target.value } })} />
                <Input label="Pecho" type="number" step="0.1" value={formData.medidas.pecho} onChange={(e) => setFormData({ ...formData, medidas: { ...formData.medidas, pecho: e.target.value } })} />
              </div>
              <Textarea label="Observaciones" rows={2} value={formData.observaciones} onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} />
              <Button type="submit" className="w-full">Registrar</Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {ultimo && (
            <Card hover={false}>
              <CardTitle>Último Registro</CardTitle>
              <div className="grid grid-cols-3 gap-4">
                <div><span className="text-fitness-muted text-sm">Peso</span><p className="text-white font-semibold">{ultimo.peso || '-'} kg</p></div>
                <div><span className="text-fitness-muted text-sm">Altura</span><p className="text-white font-semibold">{ultimo.altura || '-'} cm</p></div>
                <div><span className="text-fitness-muted text-sm">% Grasa</span><p className="text-white font-semibold">{ultimo.porcentajeGrasa || '-'}%</p></div>
              </div>
            </Card>
          )}

          <Table headers={['Fecha', 'Peso', 'Altura', '% Grasa', 'Brazo', 'Cintura']}>
            {progresos.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-fitness-muted">Sin registros</td></tr>
            ) : progresos.map((p) => (
              <tr key={p._id} className="hover:bg-fitness-gray/50 transition-colors">
                <Td>{new Date(p.fecha).toLocaleDateString('es-ES')}</Td>
                <Td>{p.peso || '-'}</Td>
                <Td>{p.altura || '-'}</Td>
                <Td>{p.porcentajeGrasa || '-'}</Td>
                <Td>{p.medidas?.brazo || '-'}</Td>
                <Td>{p.medidas?.cintura || '-'}</Td>
              </tr>
            ))}
          </Table>
        </div>
      </div>
    </div>
  )
}

export default Progress
