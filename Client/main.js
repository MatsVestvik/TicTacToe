// Find the empty page area from index.html.
const appElement = document.querySelector('#app')

// Local development uses Flask on your computer.
// For deployment, replace the public URL below with your Vercel backend URL.
const apiBaseUrl =
	window.API_BASE_URL ??
	(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
		? 'http://127.0.0.1:5000'
		: 'https://YOUR-BACKEND.vercel.app')

// Create the text that shows the current counter value.
const countElement = document.createElement('h1')
countElement.textContent = '0'

// Create the buttons that change the counter.
const decreaseButton = document.createElement('button')
decreaseButton.textContent = '-'

const increaseButton = document.createElement('button')
increaseButton.textContent = '+'

// Put the counter and buttons onto the page.
appElement.append(countElement, decreaseButton, increaseButton)

// Ask Flask for the current count and show it.
async function loadCount() {
	// GET asks for the current value.
	const response = await fetch(`${apiBaseUrl}/api/counter`)
	const data = await response.json()
	countElement.textContent = String(data.count)
}

// Tell Flask to increase the count by 1.
async function increaseCount() {
	const response = await fetch(`${apiBaseUrl}/api/counter/increase`, {
		method: 'POST',
	})
	const data = await response.json()
	countElement.textContent = String(data.count)
}

// Tell Flask to decrease the count by 1.
async function decreaseCount() {
	const response = await fetch(`${apiBaseUrl}/api/counter/decrease`, {
		method: 'POST',
	})
	const data = await response.json()
	countElement.textContent = String(data.count)
}

// Run the decrease code when the minus button is clicked.
decreaseButton.addEventListener('click', decreaseCount)

// Run the increase code when the plus button is clicked.
increaseButton.addEventListener('click', increaseCount)

// Load the starting value when the page opens.
loadCount()