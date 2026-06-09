const appElement = document.querySelector('#app')

function getApiBaseUrl() {
	const configuredBase = window.API_BASE_URL?.trim()
	if (configuredBase) {
		return configuredBase.replace(/\/$/, '')
	}

	if (window.location.protocol === 'file:') {
		return 'http://127.0.0.1:5000'
	}

	return window.location.origin
}

const API_BASE = getApiBaseUrl()

const styleElement = document.createElement('style')
styleElement.textContent = `
	* { box-sizing: border-box; }

	body {
		margin: 0;
		font-family: Arial, sans-serif;
		line-height: 1.4;
	}

	#app {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 16px;
	}

	.app-shell {
		width: min(100%, 560px);
		padding: 8px;
	}

	h1 {
		margin: 0 0 8px;
	}

	p {
		margin: 0;
		line-height: 1.5;
	}

	.controls-row {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 16px;
		align-items: center;
	}

	.player-prompt {
		margin-right: 4px;
	}

	button {
		appearance: none;
		border: 1px solid #999;
		background: #fff;
		color: #000;
		border-radius: 4px;
		padding: 0.6rem 0.9rem;
		font: inherit;
		cursor: pointer;
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.7;
	}

	button.selected {
		border-color: #000;
		font-weight: 700;
	}

	.status {
		margin-top: 16px;
		min-height: 1.5em;
	}

	.board {
		margin-top: 16px;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 8px;
	}

	.cell {
		aspect-ratio: 1 / 1;
		display: grid;
		place-items: center;
		font-size: clamp(2rem, 8vw, 3.5rem);
		font-weight: 700;
		border-radius: 0;
		background: #fff;
		border: 1px solid #000;
	}

	.cell:disabled {
		opacity: 1;
	}
`
document.head.append(styleElement)

function getSelectedPlayer() {
	return new URLSearchParams(window.location.search).get('player')?.toUpperCase() || ''
}

function setSelectedPlayer(player) {
	const url = new URL(window.location.href)
	url.searchParams.set('player', player)
	window.history.replaceState({}, '', url)
	currentPlayer = player
	render()
	loadGame()
}

let currentPlayer = getSelectedPlayer()
let gameState = {
	board: Array(9).fill(null),
	nextPlayer: 'X',
	winner: null,
	isTie: false,
}
let isBusy = false

const appShell = document.createElement('main')
appShell.className = 'app-shell'

const title = document.createElement('h1')
title.textContent = 'Tic Tac Toe'

const subtitle = document.createElement('p')
subtitle.textContent = 'Two devices can join the same board. Pick a side, wait for your turn, and play against each other.'

const controlsRow = document.createElement('div')
controlsRow.className = 'controls-row'

const playerPrompt = document.createElement('span')
playerPrompt.className = 'player-prompt'
playerPrompt.textContent = 'Join as:'

const xButton = document.createElement('button')
xButton.textContent = 'X'

const oButton = document.createElement('button')
oButton.textContent = 'O'

const resetButton = document.createElement('button')
resetButton.textContent = 'Reset board'

const statusElement = document.createElement('p')
statusElement.className = 'status'

const boardElement = document.createElement('div')
boardElement.className = 'board'

const cellButtons = Array.from({ length: 9 }, (_, index) => {
	const cellButton = document.createElement('button')
	cellButton.className = 'cell'
	cellButton.type = 'button'
	cellButton.addEventListener('click', () => makeMove(index))
	boardElement.append(cellButton)
	return cellButton
})

controlsRow.append(playerPrompt, xButton, oButton, resetButton)
appShell.append(title, subtitle, controlsRow, statusElement, boardElement)
appElement.replaceChildren(appShell)

xButton.addEventListener('click', () => setSelectedPlayer('X'))
oButton.addEventListener('click', () => setSelectedPlayer('O'))
resetButton.addEventListener('click', resetGame)

function getCellLabel(value) {
	return value || ''
}

function getWinnerMessage() {
	if (gameState.winner) {
		return `Player ${gameState.winner} wins.`
	}

	if (gameState.isTie) {
		return 'Game ended in a tie.'
	}

	return `Player ${gameState.nextPlayer}'s turn.`
}

function render() {
	const joinedPlayer = currentPlayer || 'not joined'
	title.textContent = 'Tic Tac Toe'
	subtitle.textContent = 'Two devices can join the same board.'
	statusElement.textContent = `${getWinnerMessage()} You are ${joinedPlayer}.`

	cellButtons.forEach((cellButton, index) => {
		const value = gameState.board[index]
		cellButton.textContent = getCellLabel(value)
		cellButton.disabled = Boolean(value) || Boolean(gameState.winner) || Boolean(gameState.isTie) || !currentPlayer || currentPlayer !== gameState.nextPlayer || isBusy
		cellButton.setAttribute('aria-label', `Cell ${index + 1}${value ? `, ${value}` : ''}`)
	})

	xButton.classList.toggle('selected', currentPlayer === 'X')
	oButton.classList.toggle('selected', currentPlayer === 'O')
	resetButton.disabled = isBusy
	playerPrompt.textContent = currentPlayer ? `Joined as ${currentPlayer}` : 'Join as:'
}

async function loadGame() {
	isBusy = true
	render()

	try {
		const response = await fetch(`${API_BASE}/api/game`)
		const data = await response.json()
		gameState = data
	} catch (error) {
		statusElement.textContent = 'Could not load the game state.'
	} finally {
		isBusy = false
		render()
	}
}

async function makeMove(index) {
	if (!currentPlayer) {
		statusElement.textContent = 'Pick X or O first.'
		return
	}

	isBusy = true
	render()

	try {
		const response = await fetch(`${API_BASE}/api/game/move?player=${encodeURIComponent(currentPlayer)}&index=${index}`, {
			method: 'POST',
		})
		const data = await response.json()
		gameState = data.state || gameState
		if (!response.ok && data.error) {
			statusElement.textContent = data.error
		}
	} catch (error) {
		statusElement.textContent = 'Move failed. Check the backend connection.'
	} finally {
		isBusy = false
		render()
	}
}

async function resetGame() {
	isBusy = true
	render()

	try {
		const response = await fetch(`${API_BASE}/api/game/reset`, {
			method: 'POST',
		})
		const data = await response.json()
		gameState = data.state || gameState
	} catch (error) {
		statusElement.textContent = 'Reset failed. Check the backend connection.'
	} finally {
		isBusy = false
		render()
	}
}

loadGame()
setInterval(loadGame, 2000)