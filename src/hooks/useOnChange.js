import { useEffect, useRef } from 'react'

/** Gọi callback mỗi khi value đổi so với lần render trước (không gọi ở lần render đầu) */
export default function useOnChange(value, callback) {
  const previous = useRef(value)
  const latest = useRef(callback)

  useEffect(() => {
    latest.current = callback
  })

  useEffect(() => {
    if (Object.is(previous.current, value)) return
    previous.current = value
    latest.current()
  }, [value])
}
