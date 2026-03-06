'use client'

import { FormField, FieldType } from '@/types'

/**
 * Block metadata — follows Typeform's bob-the-builder block definition pattern
 * (line 149285: getBlocks(welcomeScreens, fields, thankyouScreens))
 */
export interface Block {
    ref: string
    type: FieldType
    role: 'structure' | 'question' | 'ending'
    answerable: boolean
    canBeRecalled: boolean
    hasAttachment: boolean
    label: string
    order: number
}

/**
 * Block type metadata definitions
 * Based on bob-the-builder's block definition architecture
 */
const BLOCK_META: Record<string, Partial<Block>> = {
    // Structure blocks (no user input)
    cover_slide: { role: 'structure', answerable: false, canBeRecalled: false },
    statement: { role: 'structure', answerable: false, canBeRecalled: false },
    section: { role: 'structure', answerable: false, canBeRecalled: false },
    page_break: { role: 'structure', answerable: false, canBeRecalled: false },

    // Ending blocks
    end_page: { role: 'ending', answerable: false, canBeRecalled: false },
    url_redirect: { role: 'ending', answerable: false, canBeRecalled: false },

    // Question blocks (collect user input)
    short_text: { role: 'question', answerable: true, canBeRecalled: true },
    long_text: { role: 'question', answerable: true, canBeRecalled: true },
    email: { role: 'question', answerable: true, canBeRecalled: true },
    phone: { role: 'question', answerable: true, canBeRecalled: true },
    number: { role: 'question', answerable: true, canBeRecalled: true },
    name: { role: 'question', answerable: true, canBeRecalled: true },
    date: { role: 'question', answerable: true, canBeRecalled: true },
    time: { role: 'question', answerable: true, canBeRecalled: false },
    url: { role: 'question', answerable: true, canBeRecalled: true },
    address: { role: 'question', answerable: true, canBeRecalled: false },
    location: { role: 'question', answerable: true, canBeRecalled: false },
    contact_info: { role: 'question', answerable: true, canBeRecalled: false },

    // Choice blocks
    dropdown: { role: 'question', answerable: true, canBeRecalled: true },
    multiple_choice: { role: 'question', answerable: true, canBeRecalled: true },
    checkbox: { role: 'question', answerable: true, canBeRecalled: false },
    radio: { role: 'question', answerable: true, canBeRecalled: true },
    yes_no: { role: 'question', answerable: true, canBeRecalled: true },

    // Rating blocks
    star_rating: { role: 'question', answerable: true, canBeRecalled: true },
    rating: { role: 'question', answerable: true, canBeRecalled: true },
    nps: { role: 'question', answerable: true, canBeRecalled: true },
    nps_score: { role: 'question', answerable: true, canBeRecalled: true },
    linear_scale: { role: 'question', answerable: true, canBeRecalled: true },
    likert_scale: { role: 'question', answerable: true, canBeRecalled: false },
    ranking: { role: 'question', answerable: true, canBeRecalled: false },
    matrix_grid: { role: 'question', answerable: true, canBeRecalled: false },

    // Media blocks
    file_upload: { role: 'question', answerable: true, canBeRecalled: false, hasAttachment: true },
    image_upload: { role: 'question', answerable: true, canBeRecalled: false, hasAttachment: true },
    video_upload: { role: 'question', answerable: true, canBeRecalled: false, hasAttachment: true },
    signature_upload: { role: 'question', answerable: true, canBeRecalled: false, hasAttachment: true },

    // Special blocks
    payment: { role: 'question', answerable: true, canBeRecalled: false },
    legal: { role: 'question', answerable: true, canBeRecalled: false },
    captcha: { role: 'question', answerable: true, canBeRecalled: false },
}

/**
 * Convert form fields to unified block list
 * Pattern from Typeform: getBlocks(welcomeScreens, fields, thankyouScreens)
 */
export function getBlocks(fields: FormField[]): Block[] {
    return fields.map((field, index) => {
        const meta = BLOCK_META[field.type] || { role: 'question' as const, answerable: true, canBeRecalled: false }
        return {
            ref: field.id,
            type: field.type,
            role: meta.role || 'question',
            answerable: meta.answerable ?? true,
            canBeRecalled: meta.canBeRecalled ?? false,
            hasAttachment: meta.hasAttachment ?? false,
            label: field.label || field.type.replace(/_/g, ' '),
            order: index,
        }
    })
}

/**
 * Get structure tree for navigation
 * Separates welcome screens, questions, and endings
 */
export function getStructure(fields: FormField[]) {
    const blocks = getBlocks(fields)
    return {
        welcomeScreens: blocks.filter(b => b.type === 'cover_slide'),
        questions: blocks.filter(b => b.role === 'question'),
        endings: blocks.filter(b => b.role === 'ending'),
        structure: blocks.filter(b => b.role === 'structure' && b.type !== 'cover_slide'),
    }
}

/**
 * Check if a field type is answerable (collects user input)
 */
export function isAnswerable(fieldType: FieldType): boolean {
    return BLOCK_META[fieldType]?.answerable ?? true
}

/**
 * Check if a field value can be recalled/piped into other fields
 */
export function canBeRecalled(fieldType: FieldType): boolean {
    return BLOCK_META[fieldType]?.canBeRecalled ?? false
}
