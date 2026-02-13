import { useState, useCallback, useRef, useEffect } from 'react'

export function useInView(options?: IntersectionObserverInit): {
  ref: (node: Element | null) => void
  inView: boolean
} {
  const [inView, setInView] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const elementRef = useRef<Element | null>(null)

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  const ref = useCallback(
    (node: Element | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      if (!node) {
        elementRef.current = null
        return
      }

      elementRef.current = node

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry) {
            setInView(entry.isIntersecting)
          }
        },
        options
      )

      observerRef.current.observe(node)
    },
    [options?.threshold, options?.root, options?.rootMargin]
  )

  return { ref, inView }
}
