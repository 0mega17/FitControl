import { useState, useEffect } from 'react'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Table, Td } from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import { bookingsAPI } from '../../services/api'

function Bookings() {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchReservas = async () => {
    try {
      const { data } = await bookingsAPI.getMy()
      setReservas(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchReservas() }, [])

  const handleCancel = async (id) => {
    try {
      await bookingsAPI.cancel(id)
      fetchReservas()
    } catch (err) { console.error(err) }
  }

  if (loading) return <PageSpinner />

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Mis Reservas</h1>
        <p className="text-fitness-muted text-sm mt-1">Gestiona tus reservas de clases</p>
      </div>

      <Table headers={['Clase', 'Fecha', 'Estado', 'Acción']}>
        {reservas.length === 0 ? (
          <tr><td colSpan={4} className="px-4 py-8 text-center text-fitness-muted">Sin reservas</td></tr>
        ) : reservas.map((r) => (
          <tr key={r._id} className="hover:bg-fitness-gray/50 transition-colors">
            <Td>{r.clase?.nombre || 'N/A'}</Td>
            <Td className="text-fitness-muted">{new Date(r.fecha).toLocaleDateString('es-ES')}</Td>
            <Td><Badge color={r.estado === 'confirmada' ? 'confirmada' : 'cancelada'}>{r.estado}</Badge></Td>
            <Td>
              {r.estado === 'confirmada' && (
                <Button variant="danger" size="sm" onClick={() => handleCancel(r._id)}>Cancelar</Button>
              )}
            </Td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

export default Bookings
