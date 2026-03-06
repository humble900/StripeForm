'use client'

import { useEffect, useRef } from 'react'

/**
 * useZoomTracking — based on Typeform's bob-the-builder pattern (line 179280)
 * 
 * Detects browser zoom changes by tracking `window.devicePixelRatio`.
 * Calls `onZoomChange` when zoom level changes significantly.
 * 
 * @param onZoomChange - Callback with zoom percentage (100 = normal)
 * @param throttleMs - Throttle delay for resize checks (default 500ms)
 */
export function useZoomTracking(
    onZoomChange?: (zoomPercent: number, isZoomed: boolean) => void,
    throttleMs = 500
) {
    const initialRatio = useRef<number>(typeof window !== 'undefined' ? window.devicePixelRatio : 1)
    const throttling = useRef(false)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const checkZoom = () => {
            if (throttling.current) return
            throttling.current = true

            setTimeout(() => {
                const currentRatio = window.devicePixelRatio
                const changed = currentRatio !== initialRatio.current

                if (changed) {
                    initialRatio.current = currentRatio
                    const zoomPercent = Math.round(currentRatio * 100)
                    const isZoomed = zoomPercent < 75 || zoomPercent > 125
                    onZoomChange?.(zoomPercent, isZoomed)
                }

                throttling.current = false
            }, throttleMs)
        }

        window.addEventListener('resize', checkZoom)
        return () => window.removeEventListener('resize', checkZoom)
    }, [onZoomChange, throttleMs])

    return {
        /** Current zoom percentage (100 = normal) */
        getZoomPercent: () => Math.round((typeof window !== 'undefined' ? window.devicePixelRatio : 1) * 100),
        /** Whether the browser is currently zoomed beyond normal thresholds */
        isZoomed: () => {
            const pct = Math.round((typeof window !== 'undefined' ? window.devicePixelRatio : 1) * 100)
            return pct < 75 || pct > 125
        }
    }
}
