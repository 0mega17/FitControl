import { useState, useEffect } from 'react'
import { usersAPI } from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import Badge from '../../../components/ui/Badge'
import { PageSpinner } from '../../../components/ui/Spinner'
import { Input, Select } from '../../../components/ui/Input'
import { Table, Td } from '../../../components/ui/Table'
import { useToast } from '../../../context/ToastContext'

function AdminUsers() {
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroRol, setFiltroRol] = useState('')
  const [editUser, setEditUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const { user } = useAuth()
  const { addToast } = useToast()

  const fetchUsuarios = async () => {
    try {
      const params = filtroRol ? { rol: filtroRol } : {}
      const { data } = await usersAPI.getAll(params)
      setUsuarios(data)
    } catch (err) {
      addToast('Error al cargar usuarios', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsuarios() }, [filtroRol])

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await usersAPI.getAll()
        const rolesUnicos = [...new Set(data.map(u => u.rol?.nombre).filter(Boolean))]
        setRoles(rolesUnicos.map(r => ({ nombre: r })))
      } catch {}
    }
    fetchRoles()
  }, [])

  const handleToggleEstado = async (id, estadoActual) => {
    try {
      if (estadoActual === 'activo') {
        await usersAPI.deactivate(id)
        addToast('Usuario desactivado', 'success')
      } else {
        await usersAPI.activate(id)
        addToast('Usuario activado', 'success')
      }
      fetchUsuarios()
    } catch (err) {
      addToast(err.response?.data?.mensaje || 'Error', 'error')
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    try {
      await usersAPI.updateUser(editUser._id, {
        nombre: editUser.nombre,
        apellido: editUser.apellido,
        email: editUser.email
      })
      addToast('Usuario actualizado', 'success')
      setShowEditModal(false)
      fetchUsuarios()
    } catch (err) {
      addToast(err.response?.data?.mensaje || 'Error', 'error')
    }
  }

  if (loading) return <PageSpinner />

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion de Usuarios</h1>
          <p className="text-fitness-muted text-sm mt-1">Administra todos los usuarios del sistema</p>
        </div>
        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          className="input-fitness w-auto text-sm"
        >
          <option value="">Todos los roles</option>
          <option value="Administrador">Administradores</option>
          <option value="Entrenador">Entrenadores</option>
          <option value="Cliente">Clientes</option>
        </select>
      </div>

      <Table headers={['Nombre', 'Email', 'Rol', 'Estado', 'Acciones']}>
        {usuarios.length === 0 ? (
          <tr><td colSpan={5} className="px-4 py-8 text-center text-fitness-muted">No hay usuarios registrados</td></tr>
        ) : usuarios.map((u) => (
          <tr key={u._id} className="hover:bg-fitness-gray/50 transition-colors">
            <Td className="font-medium text-white">{u.nombre} {u.apellido}</Td>
            <Td className="text-fitness-muted">{u.email}</Td>
            <Td><Badge color={u.rol?.nombre === 'Administrador' ? 'danger' : u.rol?.nombre === 'Entrenador' ? 'warning' : 'info'}>{u.rol?.nombre || 'Sin rol'}</Badge></Td>
            <Td>
              <Badge color={u.estado === 'activo' ? 'success' : 'gris'}>
                {u.estado === 'activo' ? 'Activo' : 'Inactivo'}
              </Badge>
            </Td>
            <Td>
              <div className="flex gap-2">
                <Button size="xs" variant="secondary" onClick={() => { setEditUser({ ...u }); setShowEditModal(true) }}>
                  Editar
                </Button>
                {u._id !== user?._id && (
                  <Button
                    size="xs"
                    variant={u.estado === 'activo' ? 'danger' : 'secondary'}
                    onClick={() => handleToggleEstado(u._id, u.estado)}
                  >
                    {u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                  </Button>
                )}
              </div>
            </Td>
          </tr>
        ))}
      </Table>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Usuario">
        <form onSubmit={handleEdit}>
          <Input label="Nombre" value={editUser?.nombre || ''}
            onChange={(e) => setEditUser({ ...editUser, nombre: e.target.value })} required />
          <div className="mt-3">
            <Input label="Apellido" value={editUser?.apellido || ''}
              onChange={(e) => setEditUser({ ...editUser, apellido: e.target.value })} required />
          </div>
          <div className="mt-3">
            <Input label="Email" type="email" value={editUser?.email || ''}
              onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} required />
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminUsers