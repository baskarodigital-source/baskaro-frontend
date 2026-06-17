import React from 'react'

export default function AttributeList({ attributes = [], onEdit, onDelete }) {
  if (!attributes.length) {
    return <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">No attributes found.</div>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Name</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Code</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Type</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Required</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {attributes.map((item) => {
            const id = item?._id || item?.id
            return (
              <tr key={id} className="border-t border-slate-100">
                <td className="px-3 py-2 text-slate-800">{item?.name || '-'}</td>
                <td className="px-3 py-2 text-slate-600">{item?.code || '-'}</td>
                <td className="px-3 py-2 text-slate-600">{item?.type || '-'}</td>
                <td className="px-3 py-2 text-slate-600">{item?.isRequired ? 'Yes' : 'No'}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => onEdit?.(item)} className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700">Edit</button>
                    <button type="button" onClick={() => onDelete?.(id)} className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-600">Delete</button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
