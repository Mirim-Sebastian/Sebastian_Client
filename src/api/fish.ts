export type FishPayload = {
  name: string
  image: string
  message: string
  size: string
}

export type FishResponse = {
  _id: string
  id: string
  name: string
  image: string
  message: string
  size: string
}

const DEFAULT_BACKEND_BASE = 'https://sebastian-server-n5d2.onrender.com'

const API_BASE = (
  import.meta.env.VITE_API_BASE ??
  (window.location.hostname === 'localhost' ? '' : DEFAULT_BACKEND_BASE)
).replace(/\/$/, '')

export async function deleteFish(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/fish/${id}`, { method: 'DELETE' })
  if (!response.ok && response.status !== 404) {
    throw new Error(`DELETE /fish/${id} failed (${response.status})`)
  }
}

export async function getFishes(limit = 250): Promise<FishResponse[]> {
  const params = new URLSearchParams({ limit: String(limit) })
  const response = await fetch(`${API_BASE}/fish?${params}`)
  if (!response.ok) throw new Error(`GET /fish failed (${response.status})`)
  return (await response.json()) as FishResponse[]
}

export async function postFish(payload: FishPayload): Promise<FishResponse> {
  const response = await fetch(`${API_BASE}/fish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `POST /fish failed (${response.status})`)
  }

  return (await response.json()) as FishResponse
}
