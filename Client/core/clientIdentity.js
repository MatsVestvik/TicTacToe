export function getOrCreateClientId() {
	const storageKey = 'tictactoe-client-id'
	const existingId = window.localStorage.getItem(storageKey)
	if (existingId) {
		return existingId
	}

	const createdId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
	window.localStorage.setItem(storageKey, createdId)
	return createdId
}