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

    try {
      const scanner = new Html5Qrcode('reader')
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          if (processedRef.current) return
          try {
            const parsed = JSON.parse(decodedText)
            if (parsed.type === 'loyalty_user' && parsed.userId) {
              processedRef.current = true
              scanner.stop().catch(() => {})
              setIsScanning(false)
              setTimeout(() => onScan({ userId: parsed.userId }), 0)
            }
          } catch {
            // Not valid JSON, ignore
          }
        },
        () => {}
      )

      setIsScanning(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar la cámara'
      setError(msg)
    }
  }

  const stopScanner = async () => {
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
