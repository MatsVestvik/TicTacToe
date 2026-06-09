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
	:root {
		color-scheme: dark;
		font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		--bg: #0b1020;
		--panel: rgba(15, 23, 42, 0.82);
		--panel-border: rgba(148, 163, 184, 0.24);
		--text: #e2e8f0;
		--muted: #94a3b8;
		--accent: #8b5cf6;
		--accent-strong: #c084fc;
		--win: #22c55e;
	}

	* { box-sizing: border-box; }

	body {
		margin: 0;
		min-height: 100vh;
		background:
			radial-gradient(circle at top left, rgba(139, 92, 246, 0.22), transparent 32%),
			radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.14), transparent 28%),
			linear-gradient(180deg, #060912 0%, var(--bg) 100%);
		color: var(--text);
	}

	#app {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 24px;
	}

	.app-shell {
		width: min(100%, 560px);
		padding: 28px;
		border: 1px solid var(--panel-border);
		border-radius: 28px;
		background: var(--panel);
		backdrop-filter: blur(16px);
		box-shadow: 0 24px 80px rgba(2, 6, 23, 0.45);
	}

	h1 {
		margin: 0 0 8px;
		font-size: clamp(2rem, 5vw, 3.5rem);
		letter-spacing: -0.04em;
	}

	p {
		margin: 0;
		color: var(--muted);
		line-height: 1.5;
	}

	.controls-row {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 20px;
		align-items: center;
	}

	.player-prompt {
		color: var(--muted);
		margin-right: 4px;
	}

	button {
		appearance: none;
		border: 1px solid rgba(148, 163, 184, 0.25);
		background: rgba(15, 23, 42, 0.88);
		color: var(--text);
		border-radius: 14px;
		padding: 0.8rem 1rem;
		font: inherit;
		cursor: pointer;
		transition: transform 120ms ease, border-color 120ms ease, background 120ms ease, box-shadow 120ms ease;
	}

	button:hover:not(:disabled) {
		transform: translateY(-1px);
		border-color: rgba(192, 132, 252, 0.7);
		box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.12);
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}

	button.selected {
		border-color: rgba(192, 132, 252, 0.9);
		background: rgba(139, 92, 246, 0.26);
	}

	.status {
		margin-top: 18px;
		min-height: 1.5em;
		color: var(--text);
	}

	.board {
		margin-top: 18px;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px;
	}

	.cell {
		aspect-ratio: 1 / 1;
		display: grid;
		place-items: center;
		font-size: clamp(2.4rem, 8vw, 4.5rem);
		font-weight: 700;
		letter-spacing: -0.08em;
		border-radius: 20px;
		background: rgba(2, 6, 23, 0.62);
		border: 1px solid rgba(148, 163, 184, 0.22);
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
	subtitle.textContent = 'Two devices can join the same board. Pick a side, wait for your turn, and play against each other.'
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