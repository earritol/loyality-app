'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const [status, setStatus] = useState('Cargando...')

  useEffect(() => {
    const testConnection = async () => {
      const supabase = createClient()

      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setStatus('Error conectando a Supabase')
        console.error(error)
      } else {
        setStatus('Conectado a Supabase ✅')
        console.log(data)
      }
    }

    testConnection()
  }, [])

  return (
    <main style={{ padding: 20 }}>
      <h1>Loyalty App</h1>
      <p>{status}</p>
    </main>
  )
}