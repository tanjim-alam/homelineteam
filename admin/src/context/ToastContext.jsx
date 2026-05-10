import { createContext, useContext, useState, useCallback } from 'react'
import Toast from '../components/Toast'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' })

  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message })
  }, [])

  const hideToast = useCallback(() => {
    setToast(t => ({ ...t, show: false }))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
