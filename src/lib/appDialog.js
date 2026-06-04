/** Imperative API for custom alert/confirm modals (registered by DialogProvider). */

let dialogApi = null

export function registerAppDialog(api) {
  dialogApi = api
}

/**
 * @param {string} message
 * @param {{ title?: string, variant?: 'info'|'success'|'warning'|'error', confirmLabel?: string }} [options]
 */
export function appAlert(message, options = {}) {
  if (dialogApi) return dialogApi.alert(String(message || ''), options)
  console.warn('[appAlert]', message)
  return Promise.resolve()
}

/**
 * @param {string} message
 * @param {{ title?: string, confirmLabel?: string, cancelLabel?: string, destructive?: boolean }} [options]
 * @returns {Promise<boolean>}
 */
export function appConfirm(message, options = {}) {
  if (dialogApi) return dialogApi.confirm(String(message || ''), options)
  return Promise.resolve(window.confirm(message))
}
