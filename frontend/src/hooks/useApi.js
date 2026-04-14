import { useState } from 'react'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const callApi = async (fn) => {
    setLoading(true)
    setError('')
    try {
      return await fn()
    } catch (err) {
      setError(err?.response?.data?.message || 'Request failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, callApi }
}
