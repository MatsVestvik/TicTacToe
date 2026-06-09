export function getApiBaseUrl() {
	const configuredBase = window.API_BASE_URL?.trim()
	if (configuredBase) {
		return configuredBase.replace(/\/$/, '')
	}

	if (window.location.protocol === 'file:') {
		return 'http://127.0.0.1:5000'
	}

	return window.location.origin
}