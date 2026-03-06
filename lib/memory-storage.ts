/**
 * In-Memory Form Storage System
 * 
 * This system stores form data in memory for fast autosave operations
 * and only persists to the database when the user explicitly publishes.
 * 
 * Benefits:
 * - Fast autosave (no database queries)
 * - Consistent during redirects
 * - Reduced database load
 * - Better user experience
 */

import { Form, FormField } from '@/types'

interface MemoryForm {
  id: string
  title: string
  description: string
  fields: FormField[]
  settings: any
  theme: any
  userId: string
  slug: string
  lastModified: number
  isDraft: boolean
}

class MemoryFormStorage {
  private forms: Map<string, MemoryForm> = new Map()
  private localStorageKey = 'memory_forms'

  constructor() {
    this.loadFromLocalStorage()
  }

  /**
   * Store a form in memory
   */
  setForm(formId: string, form: Partial<Form>): void {
    const memoryForm: MemoryForm = {
      id: formId,
      title: form.title || 'Untitled Form',
      description: form.description || '',
      fields: form.fields || [],
      settings: form.settings || {},
      theme: form.theme || {},
      userId: form.user_id || '',
      slug: form.slug || this.generateSlug(form.title || 'Untitled Form'),
      lastModified: Date.now(),
      isDraft: true
    }

    this.forms.set(formId, memoryForm)
    this.saveToLocalStorage()

    console.log('💾 Form stored in memory:', formId, {
      title: memoryForm.title,
      fieldsCount: memoryForm.fields.length,
      lastModified: new Date(memoryForm.lastModified).toISOString()
    })
  }

  /**
   * Get a form from memory
   */
  getForm(formId: string): MemoryForm | null {
    const form = this.forms.get(formId)
    if (form) {
      console.log('📂 Form retrieved from memory:', formId, {
        title: form.title,
        fieldsCount: form.fields.length,
        lastModified: new Date(form.lastModified).toISOString()
      })
    }
    return form || null
  }

  /**
   * Update form fields in memory
   */
  updateFields(formId: string, fields: FormField[]): void {
    const form = this.forms.get(formId)
    if (form) {
      form.fields = fields
      form.lastModified = Date.now()
      this.forms.set(formId, form)
      this.saveToLocalStorage()

      console.log('🔄 Fields updated in memory:', formId, {
        fieldsCount: fields.length,
        lastModified: new Date(form.lastModified).toISOString()
      })
    }
  }

  /**
   * Update form metadata in memory
   */
  updateMetadata(formId: string, updates: Partial<Pick<MemoryForm, 'title' | 'description' | 'settings' | 'theme'>>): void {
    const form = this.forms.get(formId)
    if (form) {
      Object.assign(form, updates)
      form.lastModified = Date.now()
      this.forms.set(formId, form)
      this.saveToLocalStorage()

      console.log('📝 Metadata updated in memory:', formId, {
        updates,
        lastModified: new Date(form.lastModified).toISOString()
      })
    }
  }

  /**
   * Remove a form from memory
   */
  removeForm(formId: string): void {
    this.forms.delete(formId)
    this.saveToLocalStorage()
    console.log('🗑️ Form removed from memory:', formId)
  }

  /**
   * Get all forms for a user
   */
  getUserForms(userId: string): MemoryForm[] {
    const userForms = Array.from(this.forms.values())
      .filter(form => form.userId === userId)
      .sort((a, b) => b.lastModified - a.lastModified)

    console.log('👤 User forms from memory:', userId, {
      count: userForms.length,
      forms: userForms.map(f => ({ id: f.id, title: f.title, fieldsCount: f.fields.length }))
    })

    return userForms
  }

  /**
   * Check if a form exists in memory
   */
  hasForm(formId: string): boolean {
    return this.forms.has(formId)
  }

  /**
   * Get form count for a user
   */
  getUserFormCount(userId: string): number {
    return Array.from(this.forms.values())
      .filter(form => form.userId === userId)
      .length
  }

  /**
   * Clear all forms (useful for testing)
   */
  clear(): void {
    this.forms.clear()
    this.saveToLocalStorage()
    console.log('🧹 Memory storage cleared')
  }

  /**
   * Save to localStorage for persistence across sessions
   */
  private saveToLocalStorage(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return
      }

      const data = Array.from(this.forms.entries())
      localStorage.setItem(this.localStorageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }

  /**
   * Load from localStorage on initialization
   */
  private loadFromLocalStorage(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        console.log('📂 Skipping localStorage load (SSR environment)')
        return
      }

      const stored = localStorage.getItem(this.localStorageKey)
      if (stored) {
        const data = JSON.parse(stored)
        this.forms = new Map(data)
        console.log('📂 Loaded forms from localStorage:', this.forms.size)
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error)
    }
  }

  /**
   * Generate a unique slug
   */
  private generateSlug(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const randomSuffix = Math.random().toString(36).substring(2, 10)
    return `${baseSlug}-${randomSuffix}`
  }

  /**
   * Get memory usage statistics
   */
  getStats(): { formCount: number; totalFields: number; memoryUsage: string } {
    const formCount = this.forms.size
    const totalFields = Array.from(this.forms.values())
      .reduce((sum, form) => sum + form.fields.length, 0)

    const memoryUsage = `${formCount} forms, ${totalFields} fields`

    return { formCount, totalFields, memoryUsage }
  }
}

// Singleton instance
export const memoryStorage = new MemoryFormStorage()

// Export types
export type { MemoryForm }
