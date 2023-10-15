import { useEffect, useState } from "react"

export const useDebounce = <TValue>(
  initialValue: TValue,
  delay: number = 1000
) => {
  const [deferValue, setDeferValue] = useState<TValue>()
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDeferValue(initialValue)
    }, delay)
    return () => {
      clearTimeout(timerId)
    }
  }, [initialValue, delay])
  return deferValue as TValue
}