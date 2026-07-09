import { useState, useEffect } from 'react'
import { attendanceAPI } from '../../services/api'
import { PageSpinner } from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import { Table, Td } from '../../components/ui/Table'

function Attendance() {
  const [asistencias, setAsistencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await attendanceAPI.getAll(fecha)
        setAsistencias(data)
      } catch (err) { }
      finally { setLoading(false) }
    }
    fetch()
  }, [fecha])

  if (loading) return <PageSpinner />

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Control de Asistencia</h1>
          <p className="text-fitness-muted text-sm mt-1">Registro de ingresos de los clientes</p>
        </div>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="input-fitness w-auto text-sm"
        />
      </div>

      <Table headers={['Cliente', 'Fecha', 'Hora Entrada', 'Método', 'Estado']}>
        {asistencias.length === 0 ? (
          <tr><td colSpan={5} className="px-4 py-8 text-center text-fitness-muted">Sin asistencias registradas</td></tr>
        ) : asistencias.map((a) => (
          <tr key={a._id} className="hover:bg-fitness-gray/50 transition-colors">
            <Td>{a.cliente?.usuario?.nombre} {a.cliente?.usuario?.apellido}</Td>
            <Td className="text-fitness-muted">{new Date(a.fecha).toLocaleDateString('es-ES')}</Td>
            <Td className="text-fitness-muted">{a.horaEntrada || '-'}</Td>
            <Td><Badge color={a.metodo === 'QR' ? 'success' : 'secondary'}>{a.metodo}</Badge></Td>
            <Td><Badge color={a.presente ? 'success' : 'danger'}>{a.presente ? 'Presente' : 'Ausente'}</Badge></Td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

export default Attendance
