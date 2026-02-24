export type FishPayload = {
  name: string
  image: string
}

export type FishResponse = {
  id: string
  name: string
  image: string
}

const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')

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
