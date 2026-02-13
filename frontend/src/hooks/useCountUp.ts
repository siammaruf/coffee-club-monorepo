import { useState, useEffect, useCallback, useRef } from 'react'

export function useCountUp(
  end: number,
  duration = 1000,
  startOnView = true
): {
  ref: (node: Element | null) => void
  count: number
} {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(!startOnView)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  const ref = useCallback(
    (node: Element | null) => {
      if (!startOnView) return

      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      if (!node) return

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true
            setStarted(true)
          }
        },
        { threshold: 0.3 }
      )

      observerRef.current.observe(node)
    },
    [startOnView]
  )

  useEffect(() => {
    if (!started) return

    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic

      setCount(Math.round(eased * end))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [started, end, duration])

  return { ref, count }
}
