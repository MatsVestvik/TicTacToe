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

function getOrCreateClientId() {
	const storageKey = 'tictactoe-client-id'
	const existingId = window.localStorage.getItem(storageKey)
	if (existingId) {
		return existingId
	}

	const createdId = window.crypto.randomUUID()
	window.localStorage.setItem(storageKey, createdId)
	return createdId
}

const API_BASE = getApiBaseUrl()
const CLIENT_ID = getOrCreateClientId()

const styles = document.createElement('style')
styles.textContent = `
	* { box-sizing: border-box; }

	body {
		margin: 0;
		font-family: Arial, sans-serif;
	}

	#app {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 16px;
	}

	.shell {
		width: min(100%, 420px);
	}

	h1 {
		margin: 0 0 12px;
	}

	p {
		margin: 0;
		line-height: 1.4;
	}

	.section {
		margin-top: 16px;
	}

	.buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 12px;
	}

	button {
		font: inherit;
		padding: 0.6rem 0.9rem;
		border: 1px solid #000;
		background: #fff;
		color: #000;
		cursor: pointer;
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.board {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		margin-top: 12px;
	}

	.cell {
		aspect-ratio: 1 / 1;
		font-size: 2rem;
		font-weight: 700;
	}

	.hidden {
		display: none;
	}
`
document.head.append(styles)

const shell = document.createElement('main')
shell.className = 'shell'

const title = document.createElement('h1')
title.textContent = 'Tic Tac Toe'

const subtitle = document.createElement('p')
subtitle.textContent = 'Choose a mode to start.'

const menuSection = document.createElement('section')
menuSection.className = 'section'

const menuButtons = document.createElement('div')
menuButtons.className = 'buttons'

const multiplayerButton = document.createElement('button')
multiplayerButton.textContent = 'Multiplayer'

const singleplayerButton = document.createElement('button')
singleplayerButton.textContent = 'Singleplayer (coming soon)'
singleplayerButton.disabled = true

const localButton = document.createElement('button')
localButton.textContent = 'Local (coming soon)'
localButton.disabled = true

menuButtons.append(multiplayerButton, singleplayerButton, localButton)
menuSection.append(menuButtons)

const queueSection = document.createElement('section')
queueSection.className = 'section hidden'

const queueStatus = document.createElement('p')
const leaveQueueButton = document.createElement('button')
leaveQueueButton.textContent = 'Leave queue'

queueSection.append(queueStatus, document.createElement('div'))
queueSection.querySelector('div').className = 'buttons'
queueSection.querySelector('div').append(leaveQueueButton)

const gameSection = document.createElement('section')
gameSection.className = 'section hidden'

const gameStatus = document.createElement('p')
const gameButtons = document.createElement('div')
gameButtons.className = 'buttons'

const leaveGameButton = document.createElement('button')
leaveGameButton.textContent = 'Leave match'

const resetGameButton = document.createElement('button')
resetGameButton.textContent = 'Reset board'

gameButtons.append(leaveGameButton, resetGameButton)

const board = document.createElement('div')
board.className = 'board'

const cellButtons = Array.from({ length: 9 }, (_, index) => {
	const cellButton = document.createElement('button')
	cellButton.className = 'cell'
	cellButton.type = 'button'
	cellButton.addEventListener('click', () => playMove(index))
	board.append(cellButton)
	return cellButton
})

gameSection.append(gameStatus, gameButtons, board)
shell.append(title, subtitle, menuSection, queueSection, gameSection)
appElement.replaceChildren(shell)

let scene = 'menu'
let multiplayerState = {
	state: 'idle',
	symbol: null,
	queuePosition: null,
	match: null,
}
let isBusy = false

function setScene(nextScene) {
	scene = nextScene
	render()
}

function showMenu() {
	setScene('menu')
}

function showQueue() {
	setScene('queue')
}

function showGame() {
	setScene('game')
}

function renderBoard() {
	const match = multiplayerState.match
	const boardState = match?.board || Array(9).fill(null)
	const nextPlayer = match?.nextPlayer || 'X'
	const winner = match?.winner
	const isTie = match?.isTie
	const symbol = multiplayerState.symbol

	cellButtons.forEach((cellButton, index) => {
		const value = boardState[index]
		cellButton.textContent = value || ''
		cellButton.disabled = Boolean(value) || Boolean(winner) || Boolean(isTie) || symbol !== nextPlayer || isBusy
	})

	if (winner) {
		gameStatus.textContent = `Player ${winner} wins. You are ${symbol}.`
		return
	}

	if (isTie) {
		gameStatus.textContent = `Tie game. You are ${symbol}.`
		return
	}

	gameStatus.textContent = `You are ${symbol}. Player ${nextPlayer}'s turn.`
}

function render() {
	menuSection.classList.toggle('hidden', scene !== 'menu')
	queueSection.classList.toggle('hidden', scene !== 'queue')
	gameSection.classList.toggle('hidden', scene !== 'game')

	if (scene === 'menu') {
		subtitle.textContent = 'Choose a mode to start.'
	}

	if (scene === 'queue') {
		subtitle.textContent = 'Waiting to be matched with another player.'
		queueStatus.textContent = multiplayerState.queuePosition
			? `You are in the queue. Position ${multiplayerState.queuePosition}.`
			: 'You are in the queue.'
	}

	if (scene === 'game') {
		subtitle.textContent = 'Multiplayer match.'
		renderBoard()
	}

	multiplayerButton.disabled = isBusy
	leaveQueueButton.disabled = isBusy
	leaveGameButton.disabled = isBusy
	resetGameButton.disabled = isBusy
}

async function joinMultiplayer() {
	isBusy = true
	render()

	try {
		const response = await fetch(`${API_BASE}/api/multiplayer/join`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ clientId: CLIENT_ID }),
		})
		const data = await response.json()
		multiplayerState = data.status || multiplayerState
		if (multiplayerState.state === 'matched' || multiplayerState.state === 'finished') {
			showGame()
		} else if (multiplayerState.state === 'queued') {
			showQueue()
		} else {
			showMenu()
		}
	} catch (error) {
		subtitle.textContent = 'Could not join multiplayer.'
	} finally {
		isBusy = false
		render()
	}
}

async function leaveMultiplayer() {
	isBusy = true
	render()

	try {
		await fetch(`${API_BASE}/api/multiplayer/leave`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ clientId: CLIENT_ID }),
		})
		multiplayerState = {
			state: 'idle',
			symbol: null,
			queuePosition: null,
			match: null,
		}
		showMenu()
	} catch (error) {
		subtitle.textContent = 'Could not leave the match.'
	} finally {
		isBusy = false
		render()
	}
}

async function loadMultiplayerState() {
	try {
		const response = await fetch(`${API_BASE}/api/multiplayer/status?clientId=${encodeURIComponent(CLIENT_ID)}`)
		const data = await response.json()
		multiplayerState = data.status || multiplayerState

		if (multiplayerState.state === 'queued') {
			showQueue()
		} else if (multiplayerState.state === 'matched' || multiplayerState.state === 'finished') {
			showGame()
		} else {
			showMenu()
		}
	} catch (error) {
		showMenu()
	} finally {
		render()
	}
}

async function playMove(index) {
	if (!multiplayerState.symbol) {
		return
	}

	isBusy = true
	render()

	try {
		const response = await fetch(`${API_BASE}/api/game/move`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				clientId: CLIENT_ID,
				index,
			}),
		})
		const data = await response.json()
		multiplayerState = data.status || multiplayerState
	} catch (error) {
		gameStatus.textContent = 'Could not make that move.'
	} finally {
		isBusy = false
		render()
	}
}

async function resetBoard() {
	isBusy = true
	render()

	try {
		const response = await fetch(`${API_BASE}/api/game/reset`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ clientId: CLIENT_ID }),
		})
		const data = await response.json()
		multiplayerState = data.status || multiplayerState
	} catch (error) {
		gameStatus.textContent = 'Could not reset the board.'
	} finally {
		isBusy = false
		render()
	}
}

multiplayerButton.addEventListener('click', joinMultiplayer)
leaveQueueButton.addEventListener('click', leaveMultiplayer)
leaveGameButton.addEventListener('click', leaveMultiplayer)
resetGameButton.addEventListener('click', resetBoard)

loadMultiplayerState()
setInterval(loadMultiplayerState, 2000)