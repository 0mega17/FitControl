import { useState } from 'react'
import Button from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Spinner } from '../../../components/ui/Spinner'
import { attendanceAPI } from '../../../services/api'

function MyQR() {
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const generateQR = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const { data } = await attendanceAPI.generateQR()
      setQrData(data)
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al generar QR')
    } finally {
      setLoading(false)
    }
  }

  const registerQR = async () => {
    if (!qrData) return
    setLoading(true)
    try {
      await attendanceAPI.registerByQR(qrData.qrData)
      setSuccess('Asistencia registrada exitosamente')
      setQrData(null)
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-lg mx-auto">
        <Card className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Código QR de Asistencia</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          {!qrData ? (
            <div className="py-4">
              <p className="text-fitness-muted text-sm mb-4">
                Genera tu código QR para registrar tu entrada al gimnasio
              </p>
              <Button variant="primary" size="lg" onClick={generateQR} disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Generar QR'}
              </Button>
            </div>
          ) : (
            <div>
              <div className="bg-fitness-gray p-4 rounded-lg mb-3">
                <p className="mb-1 text-sm font-semibold text-white">Token:</p>
                <code className="text-fitness-muted text-sm break-all">{qrData.qrToken}</code>
              </div>
              <p className="text-fitness-muted text-sm mb-4">
                Escanea este código o presiona &quot;Registrar Entrada&quot;
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="primary" onClick={registerQR} disabled={loading}>
                  {loading ? <Spinner size="sm" /> : 'Registrar Entrada'}
                </Button>
                <Button variant="secondary" onClick={generateQR}>Regenerar</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default MyQR
