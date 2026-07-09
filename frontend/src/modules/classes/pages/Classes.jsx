import { useState, useEffect } from 'react'
import { classesAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Card, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'

function Classes() {
  const [clases, setClases] = useState([])
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const { user } = useAuth()

  const esCliente = user?.rol?.nombre === 'Cliente'
  const esAdminOEntrenador = user?.rol?.nombre === 'Administrador' || user?.rol?.nombre === 'Entrenador'

  const fetchClases = async () => {
    try {
      const { data } = await classesAPI.getAll()
      setClases(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchClases() }, [])

  const handleInscribirse = async (id) => {
    try {
      await classesAPI.toggleInscripcion(id)
      setSuccess('Inscripción actualizada')
      fetchClases()
    } catch (err) { console.error(err) }
  }

  if (loading) return <PageSpinner />

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Clases Grupales</h1>
        <p className="text-fitness-muted text-sm mt-1">Gestiona tus clases grupales</p>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          {success}
        </div>
      )}

      {clases.length === 0 ? (
        <p className="text-fitness-muted text-center py-8">No hay clases disponibles</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clases.map((c) => (
            <Card key={c._id} className="h-full flex flex-col">
              <CardTitle>{c.nombre}</CardTitle>
              <p className="text-fitness-muted text-sm mb-2">
                {c.diaSemana} | {c.horaInicio} - {c.horaFin}
              </p>
              <div className="mb-3">
                <Badge color="info">{c.entrenador?.usuario?.nombre}</Badge>
              </div>
              {c.descripcion && (
                <p className="text-fitness-muted text-sm mb-3">{c.descripcion}</p>
              )}
              <div className="flex items-center justify-between mt-auto pt-2">
                <Badge color={c.cuposDisponibles > 0 ? 'success' : 'danger'}>
                  {c.cuposDisponibles} / {c.capacidad} cupos
                </Badge>
                {esCliente && (
                  <Button
                    size="sm"
                    variant={c.inscritos?.some(i => i?.usuario?._id === user?._id) ? 'danger' : 'primary'}
                    onClick={() => handleInscribirse(c._id)}
                  >
                    {c.inscritos?.some(i => i?.usuario?._id === user?._id) ? 'Cancelar' : 'Inscribirse'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Classes
