'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

type Props = {
    onScan: (data: { userId: string }) => void
}

export default function QRScanner({ onScan }: Props) {
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const [isScanning, setIsScanning] = useState(false)

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { })
            }
        }
    }, [])

    const startScanner = async () => {
        const scanner = new Html5Qrcode('reader')
        scannerRef.current = scanner

        await scanner.start(
            { facingMode: 'environment' },
            {
                fps: 10,
                qrbox: 250,
            },
            (decodedText) => {
                try {
                    const parsed = JSON.parse(decodedText)

                    if (parsed.type === 'loyalty_user') {
                        onScan({ userId: parsed.userId })

                        scanner.stop()
                        setIsScanning(false)
                    }
                } catch (e) {
                    console.error('QR inválido', e)
                }
            },
            () => {
                // Callback silencioso cuando no detecta QR válido
            }
        )

        setIsScanning(true)
    }

    const stopScanner = async () => {
        if (scannerRef.current) {
            await scannerRef.current.stop()
            setIsScanning(false)
        }
    }

    return (
        <div>
            <div id="reader" style={{ width: '100%' }} />

            {!isScanning ? (
                <button onClick={startScanner}>
                    Iniciar escaneo
                </button>
            ) : (
                <button onClick={stopScanner}>
                    Detener
                </button>
            )}
        </div>
    )
}