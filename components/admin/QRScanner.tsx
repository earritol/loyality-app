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

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const startScanner = async () => {
    processedRef.current = false
    const scanner = new Html5Qrcode('reader')
    scannerRef.current = scanner

    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        if (processedRef.current) return
        try {
          const parsed = JSON.parse(decodedText)
          if (parsed.type === 'loyalty_user') {
            processedRef.current = true
            scanner.stop().catch(() => {})
            setIsScanning(false)
            setTimeout(() => onScan({ userId: parsed.userId }), 0)
          }
        } catch {
          // QR inválido, ignorar
        }
      },
      () => {}
    )

    setIsScanning(true)
  }

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop()
      } catch {
        // ya detenido
      }
    }
    setIsScanning(false)
  }

  return (
    <div>
      <div id="reader" style={{ width: '100%' }} />
      {!isScanning ? (
        <button
          onClick={startScanner}
          className="mt-3 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Iniciar escaneo
        </button>
      ) : (
        <button
          onClick={stopScanner}
          className="mt-3 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Detener
        </button>
      )}
    </div>
  )
}
