import React from 'react'
import { motion } from 'framer-motion'

export function WhatsAppWidget() {
  const raw = import.meta.env.VITE_WHATSAPP_PHONE
  const digits = raw ? String(raw).replace(/\D/g, '') : ''
  if (!digits) return null
  const wa = digits.startsWith('91') ? digits : `91${digits}`
  return (
    <motion.a
      href={`https://wa.me/${wa}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 transition-all hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-500/50 sm:bottom-6 sm:right-6"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      aria-label="Chat with us on WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
        fill="currentColor"
        className="h-8 w-8"
      >
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 413.4c-33.6 0-66.6-9-95.6-26l-6.8-4.1-70.9 18.6 19-69.2-4.5-7.2c-18.7-29.8-28.5-64.2-28.5-99.4 0-104.7 85.3-190 190-190 50.8 0 98.4 19.8 134.3 55.7 35.9 35.9 55.7 83.5 55.7 134.3 0 104.7-85.3 190.1-190.1 190.1zm104.5-142.3c-5.7-2.9-33.9-16.7-39.1-18.6-5.2-1.9-9-2.9-12.8 2.9-3.8 5.7-14.8 18.6-18.1 22.4-3.3 3.8-6.6 4.3-12.4 1.4-5.7-2.9-24.1-8.9-46-28.5-17.1-15.3-28.7-34.1-32-39.8-3.3-5.7-.4-8.8 2.5-11.7 2.6-2.6 5.7-6.7 8.6-10 2.9-3.3 3.8-5.7 5.7-9.5 1.9-3.8.9-7.1-.4-10-1.4-2.9-12.8-30.9-17.5-42.4-4.6-11.2-9.3-9.7-12.8-9.9-3.3-.2-7.1-.2-11-.2-3.8 0-10 1.4-15.3 7.1-5.2 5.7-20 19.5-20 47.1 0 27.6 20.4 54.3 23.3 58.1 2.9 3.8 39.6 60.5 95.8 84.8 13.4 5.8 23.9 9.3 32.1 11.9 13.5 4.3 25.8 3.7 35.5 2.2 11-1.7 33.9-13.8 38.6-27.1 4.8-13.3 4.8-24.8 3.3-27.1-1.5-2.4-5.3-3.9-11.1-6.8z" />
      </svg>
    </motion.a>
  )
}
