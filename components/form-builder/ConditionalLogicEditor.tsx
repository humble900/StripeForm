'use client'

import React, { useState } from 'react'
import { ConditionalLogic, FormField, FieldType } from '@/types'

interface ConditionalLogicEditorProps {
  field: FormField
  allFields: FormField[]
  onUpdate: (conditional: ConditionalLogic) => void
  onRemove: () => void
}

export function ConditionalLogicEditor({ field, allFields, onUpdate, onRemove }: ConditionalLogicEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [conditional, setConditional] = useState<ConditionalLogic>(
    field.conditional || {
      fieldId: '',
      operator: 'equals',
      value: '',
      action: 'show'
    }
  )

  const availableFields = allFields.filter(f => f.id !== field.id && f.type !== 'section' && f.type !== 'page_break')
  
  const operators = [
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'does not equal' },
    { value: 'contains', label: 'contains' },
    { value: 'greater_than', label: 'greater than' },
    { value: 'less_than', label: 'less than' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
  ]

  const actions = [
    { value: 'show', label: 'Show this field' },
    { value: 'hide', label: 'Hide this field' },
  ]

  const handleUpdate = (updates: Partial<ConditionalLogic>) => {
    const updated = { ...conditional, ...updates }
    setConditional(updated)
    onUpdate(updated)
  }

  const getValueInput = () => {
    const targetField = allFields.find(f => f.id === conditional.fieldId)
    if (!targetField) return null

    switch (targetField.type) {
      case 'multiple_choice':
      case 'dropdown':
      case 'radio':
        return (
          <select
            value={conditional.value as string}
            onChange={(e) => handleUpdate({ value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an option</option>
            {targetField.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      
      case 'checkbox':
        return (
          <select
            value={conditional.value as string}
            onChange={(e) => handleUpdate({ value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="true">Checked</option>
            <option value="false">Unchecked</option>
          </select>
        )
      
      case 'number':
      case 'rating':
      case 'nps':
        return (
          <input
            type="number"
            value={conditional.value as string}
            onChange={(e) => handleUpdate({ value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter value"
          />
        )
      
      default:
        return (
          <input
            type="text"
            value={conditional.value as string}
            onChange={(e) => handleUpdate({ value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter value"
          />
        )
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-900">Conditional Logic</h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          <button
            onClick={onRemove}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Field Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              When this field:
            </label>
            <select
              value={conditional.fieldId}
              onChange={(e) => handleUpdate({ fieldId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a field</option>
              {availableFields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Operator Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operator:
            </label>
            <select
              value={conditional.operator}
              onChange={(e) => handleUpdate({ operator: e.target.value as ConditionalLogic['operator'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {operators.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          {/* Value Input (only show for non-empty operators) */}
          {!['is_empty', 'is_not_empty'].includes(conditional.operator) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value:
              </label>
              {getValueInput()}
            </div>
          )}

          {/* Action Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Then:
            </label>
            <select
              value={conditional.action}
              onChange={(e) => handleUpdate({ action: e.target.value as ConditionalLogic['action'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {actions.map((action) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Preview:</strong> {conditional.fieldId ? 
                `When "${allFields.find(f => f.id === conditional.fieldId)?.label}" ${conditional.operator} ${conditional.value || ''}, ${conditional.action} this field` :
                'Select a field to see the condition preview'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 