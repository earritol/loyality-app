'use client'

import { QRCodeSVG } from 'qrcode.react'

export function UserQR({ userId }: { userId: string }) {
  const qrData = JSON.stringify({
    type: 'loyalty_user',
    userId,
  })

  return (
    <div className="flex flex-col items-center">
      <QRCodeSVG
        value={qrData}
        size={180}
        bgColor="#ffffff"
        fgColor="#000000"
        level="M"
      />
    </div>
  )
}
