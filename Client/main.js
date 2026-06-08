// Find the empty page area from index.html.
const appElement = document.querySelector('#app')

// Create the text that shows the current counter value.
const countElement = document.createElement('h1')
countElement.textContent = '0'

// Create the button that sends the increment request.
const buttonElement = document.createElement('button')
buttonElement.textContent = '+'

// Put the counter and button onto the page.
appElement.append(countElement, buttonElement)

// Ask Flask for the current count and show it.
async function loadCount() {
	const response = await fetch('http://127.0.0.1:5000/api/counter')
	const data = await response.json()
	countElement.textContent = String(data.count)
}

// Tell Flask to add 1, then update the number on screen.
async function incrementCount() {
	const response = await fetch('http://127.0.0.1:5000/api/counter', {
		method: 'POST',
	})
	const data = await response.json()
	countElement.textContent = String(data.count)
}

// Run the increment code when the button is clicked.
buttonElement.addEventListener('click', incrementCount)

// Load the starting value when the page opens.
loadCount()