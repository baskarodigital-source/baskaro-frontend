import { Navigate } from 'react-router-dom'

/** Legacy URL — category home lives at /sell/phone */
export default function SellPhonePage() {
  return <Navigate to="/sell/phone" replace />
}
