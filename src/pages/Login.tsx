import { useEffect } from 'react'
import { BASE_URL } from '../config/config'

export default function Login() {
  useEffect(() => {
    window.location.href = `${String(BASE_URL).includes("binarykeeda.com") ? '"https://login.binarykeeda.com"' : 'http://localhost:5174'}`
  }, [])
  return (
    <>
    </>
  )
}
