const PREFIX = 'narmy_'

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value))
  } catch {
    // localStorage full or unavailable — silently ignore in prototype
  }
}

export function clearStorage(): void {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX))
  keys.forEach((k) => localStorage.removeItem(k))
}
