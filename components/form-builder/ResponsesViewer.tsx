import React, { useEffect, useState } from 'react'

import { Form } from '@/types'

export function ResponsesViewer({ form }: { form: Form }) {
  const [rows, setRows] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const response = await fetch(`/api/user/forms/${form.id}/responses`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (mounted) setRows(data.data || [])
        } else {
          throw new Error('Failed to load responses')
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load responses')
      }
    }
    void load()
    return () => { mounted = false }
  }, [form.id])

  if (error) return <div className="p-3 text-sm text-red-600">{error}</div>
  if (!rows) return <div className="p-3 text-sm text-gray-500">Loading responses…</div>
  if (rows.length === 0) return <div className="p-3 text-sm text-gray-500">No responses yet.</div>

  const isUrlArray = (v: any) => Array.isArray(v) && v.every((x) => typeof x === 'string' && /^https?:\/\//.test(x))

  return (
    <div className="p-3 space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          <div className="mb-2 text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
          <div className="grid gap-2">
            {Object.entries(r.responses || {}).map(([k, v]) => (
              <div key={k} className="text-sm">
                <div className="font-medium text-gray-700">{k}</div>
                {isUrlArray(v) ? (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(v as string[]).map((url) => (
                      <a key={url} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs text-blue-700 hover:bg-blue-50">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12a5 5 0 015-5h3v2h-3a3 3 0 100 6h3v2h-3a5 5 0 01-5-5Zm6.2 1h3.8v-2H10.1v2Zm5-6h3a5 5 0 110 10h-3v-2h3a3 3 0 000-6h-3V7Z"/></svg>
                        <span className="truncate max-w-[180px]">{url}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="mt-1 text-gray-700">{Array.isArray(v) ? JSON.stringify(v) : String(v ?? '')}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}


