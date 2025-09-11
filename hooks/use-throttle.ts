import { useCallback, useRef, useEffect } from "react"

export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
  deps: any[] = []
): T {
  const lastCall = useRef<number>(0)
  const timeoutId = useRef<NodeJS.Timeout>()
  const callbackRef = useRef(callback)

  // 更新回调引用
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }
    }
  }, [])

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now()

    if (now - lastCall.current >= delay) {
      callbackRef.current(...args)
      lastCall.current = now
    } else {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }

      timeoutId.current = setTimeout(() => {
        callbackRef.current(...args)
        lastCall.current = Date.now()
      }, delay)
    }
  }, [delay, ...deps]) as T
}