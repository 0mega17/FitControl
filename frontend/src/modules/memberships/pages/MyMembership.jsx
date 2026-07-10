import { useState, useEffect } from 'react'
import { membershipsAPI } from '../../../services/api'
import { formatCOP } from '../../../utils/format'
import { Card, CardTitle } from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import { PageSpinner } from '../../../components/ui/Spinner'
import { Table, Td } from '../../../components/ui/Table'
import { useToast } from '../../../context/ToastContext'

function MyMembership() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: res } = await membershipsAPI.getMy()
        setData(res)
      } catch (err) {
        addToast('Error al cargar membresias', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <PageSpinner />

  const activeMembership = data?.membresias?.find(m => m.estado === 'activa')
  const total = data?.membresias?.length || 0
  const daysLeft = activeMembership
    ? Math.ceil((new Date(activeMembership.fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24))
    : 0
  const progress = activeMembership
    ? Math.min(100, Math.max(0, ((activeMembership.fechaVencimiento - activeMembership.fechaInicio) -
      (new Date(activeMembership.fechaVencimiento) - new Date())) /
      (activeMembership.fechaVencimiento - activeMembership.fechaInicio) * 100))
    : 0

  const formatDate = (date) => new Date(date).toLocaleDateString('es-ES')

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Mi Membresia</h1>
        <p className="text-fitness-muted text-sm mt-1">Informacion de tu plan y pagos</p>
      </div>

      {activeMembership ? (
        <Card hover={false} className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Plan {activeMembership.tipo}</CardTitle>
              <p className="text-fitness-muted text-sm mt-1">
                Inicio: {formatDate(activeMembership.fechaInicio)}
              </p>
              <p className="text-fitness-muted text-sm">
                Vence: {formatDate(activeMembership.fechaVencimiento)}
              </p>
              <p className="text-2xl font-bold text-white mt-2">{formatCOP(activeMembership.precio)}</p>
            </div>
            <div className="text-right">
              <Badge color={daysLeft <= 3 ? 'danger' : daysLeft <= 7 ? 'warning' : 'success'} size="lg">
                {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Vencida'}
              </Badge>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-fitness-gray rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  daysLeft <= 3 ? 'bg-red-500' : daysLeft <= 7 ? 'bg-orange-400' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
            <p className="text-xs text-fitness-muted mt-1">
              {Math.round(Math.min(100, progress))}% del plan transcurrido
            </p>
          </div>
        </Card>
      ) : (
        <Card hover={false} className="mb-6">
          <div className="text-center py-6">
            <p className="text-fitness-muted text-lg">No tienes una membresia activa</p>
            <p className="text-fitness-muted text-sm mt-1">Contacta con administracion para adquirir un plan</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card hover={false}>
          <p className="text-fitness-muted text-xs uppercase tracking-wide">Total Membresias</p>
          <p className="text-2xl font-bold text-white mt-1">{total}</p>
        </Card>
        <Card hover={false}>
          <p className="text-fitness-muted text-xs uppercase tracking-wide">Pagos Realizados</p>
          <p className="text-2xl font-bold text-white mt-1">{data?.pagos?.length || 0}</p>
        </Card>
        <Card hover={false}>
          <p className="text-fitness-muted text-xs uppercase tracking-wide">Total Pagado</p>
          <p className="text-2xl font-bold text-white mt-1">
            ${data?.pagos?.reduce((s, p) => s + p.valor, 0) || 0}
          </p>
        </Card>
      </div>

      <Card hover={false}>
        <CardTitle>Historial de Pagos</CardTitle>
        {(!data?.pagos || data.pagos.length === 0) ? (
          <p className="text-fitness-muted text-sm py-4">No hay pagos registrados</p>
        ) : (
          <Table headers={['Fecha', 'Metodo', 'Monto', 'Membresia']}>
            {data.pagos.map((p) => (
              <tr key={p._id} className="hover:bg-fitness-gray/50 transition-colors">
                <Td className="text-fitness-muted">{formatDate(p.fechaPago)}</Td>
                <Td><Badge color="info">{p.metodoPago}</Badge></Td>
                <Td className="font-mono">${p.valor}</Td>
                <Td className="text-fitness-muted">{p.membresia?.tipo || '-'}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  )
}

export default MyMembership