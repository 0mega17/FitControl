import { useState, useEffect } from 'react'
import { reportsAPI } from '../../../services/api'
import { Card, CardTitle } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/Input'
import { Table, Td } from '../../../components/ui/Table'
import Badge from '../../../components/ui/Badge'
import { PageSpinner } from '../../../components/ui/Spinner'

function Reports() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [desde, setDesde] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0])
  const [hasta, setHasta] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const { data } = await reportsAPI.get({ desde, hasta })
        setReport(data)
      } catch (err) { }
      finally { setLoading(false) }
    }
    fetch()
  }, [desde, hasta])

  if (loading) return <PageSpinner />

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Reportes y Estadísticas</h1>
        <p className="text-fitness-muted text-sm mt-1">Visualiza las métricas del gimnasio</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input label="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div className="flex-1">
          <Input label="Hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="text-center" hover={false}>
          <CardTitle className="text-3xl">{report?.totalClientes || 0}</CardTitle>
          <p className="text-sm text-fitness-muted mt-1">Total Clientes</p>
        </Card>
        <Card className="text-center" hover={false}>
          <CardTitle className="text-3xl">${report?.totalIngresos?.toLocaleString() || 0}</CardTitle>
          <p className="text-sm text-fitness-muted mt-1">Ingresos del Período</p>
        </Card>
        <Card className="text-center" hover={false}>
          <CardTitle className="text-3xl">{report?.totalAsistencias || 0}</CardTitle>
          <p className="text-sm text-fitness-muted mt-1">Asistencias Registradas</p>
        </Card>
        <Card className="text-center" hover={false}>
          <CardTitle className="text-3xl">{report?.membresiasVendidas || 0}</CardTitle>
          <p className="text-sm text-fitness-muted mt-1">Membresías Vendidas</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardTitle>Distribución de Membresías</CardTitle>
          <div className="mt-4">
            <Table headers={['Tipo', 'Cantidad', 'Total']}>
              {report?.distribucionMembresias?.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-fitness-muted">Sin datos</td></tr>
              ) : report?.distribucionMembresias?.map((d, i) => (
                <tr key={i} className="hover:bg-fitness-gray/50 transition-colors">
                  <Td>{d._id}</Td>
                  <Td>{d.count}</Td>
                  <Td className="font-mono">${d.total}</Td>
                </tr>
              ))}
            </Table>
          </div>
        </Card>

        <Card>
          <CardTitle>Asistencias por Día</CardTitle>
          <div className="mt-4">
            <Table headers={['Fecha', 'Asistencias']}>
              {report?.asistenciasPorDia?.length === 0 ? (
                <tr><td colSpan={2} className="px-4 py-8 text-center text-fitness-muted">Sin datos</td></tr>
              ) : report?.asistenciasPorDia?.map((a, i) => (
                <tr key={i} className="hover:bg-fitness-gray/50 transition-colors">
                  <Td>{a._id}</Td>
                  <Td><Badge color="info">{a.count}</Badge></Td>
                </tr>
              ))}
            </Table>
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle>Últimos Pagos</CardTitle>
        <div className="mt-4">
          <Table headers={['Fecha', 'Cliente', 'Valor', 'Método']}>
            {report?.ultimosPagos?.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-fitness-muted">Sin pagos</td></tr>
            ) : report?.ultimosPagos?.map((p, i) => (
              <tr key={i} className="hover:bg-fitness-gray/50 transition-colors">
                <Td>{new Date(p.fechaPago).toLocaleDateString('es-ES')}</Td>
                <Td>{p.cliente?.usuario?.nombre || 'N/A'}</Td>
                <Td className="font-mono">${p.valor}</Td>
                <Td><Badge color="secondary">{p.metodoPago}</Badge></Td>
              </tr>
            ))}
          </Table>
        </div>
      </Card>
    </div>
  )
}

export default Reports
