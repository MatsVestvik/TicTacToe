export class MultiplayerApi {
	constructor(apiBaseUrl) {
		this.apiBaseUrl = apiBaseUrl
	}

	async join(clientId) {
		return this.request('/api/multiplayer/join', {
			method: 'POST',
			body: { clientId },
		})
	}

	async status(clientId) {
		return this.request(`/api/multiplayer/status?clientId=${encodeURIComponent(clientId)}`)
	}

	async leave(clientId) {
		return this.request('/api/multiplayer/leave', {
			method: 'POST',
			body: { clientId },
		})
	}

	async move(clientId, index) {
		return this.request('/api/game/move', {
			method: 'POST',
			body: { clientId, index },
		})
	}

	async reset(clientId) {
		return this.request('/api/game/reset', {
			method: 'POST',
			body: { clientId },
		})
	}

	async request(path, options = {}) {
		const response = await fetch(`${this.apiBaseUrl}${path}`, {
			method: options.method || 'GET',
			headers: {
				'Content-Type': 'application/json',
				...(options.headers || {}),
			},
			body: options.body ? JSON.stringify(options.body) : undefined,
		})

		const data = await response.json()
		if (!response.ok) {
			throw new Error(data.error || 'Request failed')
		}

		return data
	}
}