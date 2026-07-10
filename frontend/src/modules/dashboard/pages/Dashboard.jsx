import { useState, useEffect } from 'react'
import { reportsAPI } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { PageSpinner } from '../../components/ui/Spinner'
import {
  FiUsers, FiUserCheck, FiCheckCircle, FiAlertTriangle,
  FiXCircle, FiClipboard, FiDollarSign
} from 'react-icons/fi'

const ICONS = {
  clientes: FiUsers,
  entrenadores: FiUserCheck,
  activas: FiCheckCircle,
  porVencer: FiAlertTriangle,
  vencidas: FiXCircle,
  asistencias: FiClipboard,
  ingresos: FiDollarSign,
}

const COLORS = {
  clientes: 'border-blue-500',
  entrenadores: 'border-green-500',
  activas: 'border-green-500',
  porVencer: 'border-yellow-500',
  vencidas: 'border-red-500',
  asistencias: 'border-purple-500',
  ingresos: 'border-orange-500',
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className={`stat-card border-l-4 ${color} animate-slide-up`}>
      <div className={`p-3 rounded-lg bg-fitness-gray/50`}>
        <Icon className="text-2xl text-fitness-red" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-fitness-muted">{title}</p>
      </div>
    </div>
  )
}

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await reportsAPI.getDashboard()
        setStats(data)
      } catch (err) { }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  if (loading) return <PageSpinner />

  const cards = [
    { key: 'clientes', title: 'Total Clientes', value: stats?.totalClientes || 0 },
    { key: 'entrenadores', title: 'Total Entrenadores', value: stats?.totalEntrenadores || 0 },
    { key: 'activas', title: 'Membresias Activas', value: stats?.membresiasActivas || 0 },
    { key: 'porVencer', title: 'Proximas a Vencer', value: stats?.membresiasPorVencer || 0 },
    { key: 'vencidas', title: 'Membresias Vencidas', value: stats?.membresiasVencidas || 0 },
    { key: 'asistencias', title: 'Asistencias Hoy', value: stats?.asistenciasHoy || 0 },
    { key: 'ingresos', title: 'Ingresos del Mes', value: `$${stats?.ingresosMes?.toLocaleString() || 0}` },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Panel de Administracion</h1>
        <p className="text-fitness-muted text-sm mt-1">Resumen general del gimnasio</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <StatCard
            key={card.key}
            title={card.title}
            value={card.value}
            icon={ICONS[card.key]}
            color={COLORS[card.key]}
          />
        ))}
      </div>
    </div>
  )
}

export default Dashboard
