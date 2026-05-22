/** Lightweight full-page loader for lazy route chunks */
export function PageSpinner() {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center px-4 py-16">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-red-600"
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}
