/**
 * Load Razorpay checkout.js once and open the payment modal.
 * @param {{
 *   keyId: string
 *   razorpayOrderId: string
 *   amountPaise: number
 *   orderNumber?: string
 *   customer?: { name?: string, email?: string, contact?: string }
 * }} opts
 * @returns {Promise<{ razorpay_payment_id: string, razorpay_order_id: string, razorpay_signature: string }>}
 */
export function openRazorpayCheckout(opts) {
  const { keyId, razorpayOrderId, amountPaise, orderNumber, customer } = opts

  return new Promise((resolve, reject) => {
    const start = () => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay failed to load'))
        return
      }

      const rzp = new window.Razorpay({
        key: keyId,
        amount: amountPaise,
        currency: 'INR',
        name: 'Baskaro',
        description: orderNumber ? `Order ${orderNumber}` : 'Pre-owned device purchase',
        order_id: razorpayOrderId,
        prefill: {
          name: customer?.name || '',
          email: customer?.email || '',
          contact: customer?.contact || '',
        },
        theme: { color: '#DC2626' },
        handler(response) {
          resolve(response)
        },
        modal: {
          ondismiss() {
            reject(new Error('Payment cancelled'))
          },
        },
      })

      rzp.on('payment.failed', (res) => {
        const msg = res?.error?.description || 'Payment failed'
        reject(new Error(msg))
      })

      rzp.open()
    }

    if (window.Razorpay) {
      start()
      return
    }

    const existing = document.querySelector('script[data-razorpay-checkout]')
    if (existing) {
      existing.addEventListener('load', start, { once: true })
      existing.addEventListener('error', () => reject(new Error('Razorpay failed to load')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpayCheckout = '1'
    script.onload = start
    script.onerror = () => reject(new Error('Razorpay failed to load'))
    document.body.appendChild(script)
  })
}
