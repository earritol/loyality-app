'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

type Props = {
  onScan: (data: { userId: string }) => void
}

export default function QRScanner({ onScan }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const processedRef = useRef(false)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRead, setLastRead] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const startScanner = async () => {
    processedRef.current = false
    setError(null)
    setLastRead(null)
    console.log('[QRScanner] Starting scanner...')

    try {
      const scanner = new Html5Qrcode('reader')
      scannerRef.current = scanner

      const container = document.getElementById('reader')
      const width = container?.clientWidth ?? 300
      const qrbox = Math.min(Math.floor(width * 0.6), 200)
      console.log('[QRScanner] Container width:', width, 'qrbox:', qrbox)

      // Get available cameras and use the first one
      const cameras = await Html5Qrcode.getCameras()
      console.log('[QRScanner] Available cameras:', cameras.length, cameras.map(c => c.label))

      if (cameras.length === 0) {
        setError('No se encontraron cámaras')
        return
      }

      // Prefer back camera, fallback to first available
      const backCamera = cameras.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('rear'))
      const cameraId = backCamera?.id ?? cameras[0].id
      console.log('[QRScanner] Using camera:', cameraId)

      await scanner.start(
        cameraId,
        { fps: 15, qrbox: { width: qrbox, height: qrbox } },
        (decodedText) => {
          console.log('[QRScanner] Decoded:', decodedText)
          setLastRead(decodedText)

          if (processedRef.current) {
            console.log('[QRScanner] Already processed, skipping')
            return
          }

          try {
            const parsed = JSON.parse(decodedText)
            console.log('[QRScanner] Parsed:', parsed)

            if (parsed.type === 'loyalty_user' && parsed.userId) {
              console.log('[QRScanner] Valid loyalty QR! userId:', parsed.userId)
              processedRef.current = true
              scanner.stop().catch(() => {})
              setIsScanning(false)
              setTimeout(() => onScan({ userId: parsed.userId }), 0)
            } else {
              console.log('[QRScanner] Not a loyalty QR. type:', parsed.type)
            }
          } catch (e) {
            console.log('[QRScanner] Not JSON:', decodedText)
          }
        },
        (errorMessage) => {
          // Log once to confirm frames are being processed
          if (!processedRef.current && !(scannerRef.current as any)?._loggedFrameCheck) {
            console.log('[QRScanner] Frame processing active (no QR found yet)')
            if (scannerRef.current) (scannerRef.current as any)._loggedFrameCheck = true
          }
        }
      )

      console.log('[QRScanner] Scanner started successfully')
      setIsScanning(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar la cámara'
      console.error('[QRScanner] Start error:', err)
      setError(msg)
    }
  }

  const stopScanner = async () => {
    console.log('[QRScanner] Stopping scanner...')
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop()
      } catch {
        // already stopped
      }
    }
    setIsScanning(false)
  }

  return (
    <div>
      <div id="reader" style={{ width: '100%' }} />
      {error && <p className="mt-2 text-xs text-gana-error">{error}</p>}
      {lastRead && <p className="mt-2 text-xs text-gana-muted break-all">Último lectura: {lastRead}</p>}
      {!isScanning ? (
        <button onClick={startScanner}
          className="mt-3 w-full rounded-xl bg-gana-green px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
          Iniciar escaneo
        </button>
      ) : (
        <button onClick={stopScanner}
          className="mt-3 w-full rounded-xl border border-gana-border bg-gana-card px-4 py-2.5 text-sm font-semibold text-gana-text hover:opacity-90">
          Detener
        </button>
      )}
    </div>
  )
}
