'use client'

import React from 'react'

interface CaptchaFieldProps {
  onSolved?: (value: string) => void
  disabled?: boolean
}

export default function CaptchaField({ onSolved, disabled }: CaptchaFieldProps) {
  return (
    <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-600">
      <div className="flex items-center justify-between">
        <span>CAPTCHA field placeholder</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSolved?.('placeholder')}
          className="px-2 py-1 text-xs bg-gray-200 rounded disabled:opacity-50"
        >
          Simulate Solve
        </button>
      </div>
    </div>
  )
}
