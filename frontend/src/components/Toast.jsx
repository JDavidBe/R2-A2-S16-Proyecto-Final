import { useEffect, useState } from 'react'

export function Toast({ msg, tipo = 'ok', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [])

  if (!msg) return null

  return (
    <div className={`toast toast-${tipo}`} style={{ cursor:'pointer' }} onClick={onClose}>
      {tipo === 'ok' ? '✅' : '❌'} {msg}
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState(null)
  const show = (msg, tipo = 'ok') => setToast({ msg, tipo })
  const hide  = () => setToast(null)
  const ToastEl = toast
    ? <Toast msg={toast.msg} tipo={toast.tipo} onClose={hide} />
    : null
  return { show, ToastEl }
}
