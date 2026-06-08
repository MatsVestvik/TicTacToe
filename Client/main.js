const appElement = document.querySelector('#app')

const countElement = document.createElement('p')
countElement.textContent = '0'

const buttonElement = document.createElement('button')
buttonElement.type = 'button'
buttonElement.textContent = 'Increment'

appElement.append(countElement, buttonElement)

async function loadCount() {
	const response = await fetch('http://127.0.0.1:5000/api/counter')
	const data = await response.json()
	countElement.textContent = String(data.count)
}

async function incrementCount() {
	const response = await fetch('http://127.0.0.1:5000/api/counter', {
		method: 'POST',
	})
	const data = await response.json()
	countElement.textContent = String(data.count)
}

buttonElement.addEventListener('click', incrementCount)

loadCount()