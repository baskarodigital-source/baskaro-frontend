import React from 'react'
import FormField from '../components/FormField.jsx'

export default function SeoTab({ slug = '', onSlugChange, value, onChange }) {
  const next = value || { title: '', description: '', keywords: '' }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        URL and search-engine settings for this product. Product page content stays on the General tab.
      </p>

      <FormField label="URL slug" htmlFor="product-slug" hint="Optional — auto-generated from product name if empty">
        <input
          id="product-slug"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="iphone-15-pro"
          value={slug}
          onChange={(e) => onSlugChange?.(e.target.value)}
        />
      </FormField>

      <FormField label="SEO title" htmlFor="product-seo-title">
        <input
          id="product-seo-title"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Page title for search engines"
          value={next.title || ''}
          onChange={(e) => onChange?.({ ...next, title: e.target.value })}
        />
      </FormField>
      <FormField label="SEO description" htmlFor="product-seo-description">
        <textarea
          id="product-seo-description"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          rows={3}
          placeholder="Short summary for search results"
          value={next.description || ''}
          onChange={(e) => onChange?.({ ...next, description: e.target.value })}
        />
      </FormField>
      <FormField label="SEO keywords" htmlFor="product-seo-keywords" hint="Comma separated">
        <input
          id="product-seo-keywords"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="iphone, smartphone, apple"
          value={next.keywords || ''}
          onChange={(e) => onChange?.({ ...next, keywords: e.target.value })}
        />
      </FormField>
    </div>
  )
}
