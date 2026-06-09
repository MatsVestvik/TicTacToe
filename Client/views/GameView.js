export class GameView {
	constructor({ onMove, onLeave, onReset, onHome, onQueue }) {
		this.onMove = onMove
		this.root = document.createElement('section')
		this.root.className = 'ttt-section'

		this.statusElement = document.createElement('p')
		this.statusElement.className = 'ttt-status'

		const buttonRow = document.createElement('div')
		buttonRow.className = 'ttt-buttons'

		this.homeButton = document.createElement('button')
		this.homeButton.type = 'button'
		this.homeButton.className = 'ttt-button'
		this.homeButton.textContent = 'Home'
		this.homeButton.addEventListener('click', onHome)

		this.rematchButton = document.createElement('button')
		this.rematchButton.type = 'button'
		this.rematchButton.className = 'ttt-button'
		this.rematchButton.textContent = 'Rematch'
		this.rematchButton.addEventListener('click', onReset)

		this.queueButton = document.createElement('button')
		this.queueButton.type = 'button'
		this.queueButton.className = 'ttt-button'
		this.queueButton.textContent = 'Queue'
		this.queueButton.addEventListener('click', onQueue)

		this.leaveButton = document.createElement('button')
		this.leaveButton.type = 'button'
		this.leaveButton.className = 'ttt-button'
		this.leaveButton.textContent = 'Leave match'
		this.leaveButton.addEventListener('click', onLeave)

		this.resetButton = document.createElement('button')
		this.resetButton.type = 'button'
		this.resetButton.className = 'ttt-button'
		this.resetButton.textContent = 'Reset board'
		this.resetButton.addEventListener('click', onReset)

		buttonRow.append(this.homeButton, this.rematchButton, this.queueButton, this.leaveButton, this.resetButton)

		this.boardElement = document.createElement('div')
		this.boardElement.className = 'ttt-board'
		this.cellButtons = this.createCells()

		this.root.append(this.statusElement, buttonRow, this.boardElement)
	}

	createCells() {
		return Array.from({ length: 9 }, (_, index) => {
			const cellButton = document.createElement('button')
			cellButton.type = 'button'
			cellButton.className = 'ttt-button ttt-cell'
			cellButton.addEventListener('click', () => this.onMove(index))
			this.boardElement.append(cellButton)
			return cellButton
		})
	}

	render(state, isBusy) {
		const match = state.match
		const boardState = match?.board || Array(9).fill(null)
		const nextPlayer = match?.nextPlayer || 'X'
		const winner = match?.winner
		const isTie = match?.isTie
		const symbol = state.symbol

		this.cellButtons.forEach((cellButton, index) => {
			const value = boardState[index]
			cellButton.textContent = value || ''
			cellButton.disabled = Boolean(value) || Boolean(winner) || Boolean(isTie) || symbol !== nextPlayer || isBusy
		})

		if (winner) {
			if (symbol === winner) {
				this.statusElement.textContent = `You win!`
			} else {
				this.statusElement.textContent = `You lose.`
			}
		} else if (isTie) {
			this.statusElement.textContent = `Tie game.`
		} else {
			this.statusElement.textContent = `You are ${symbol}. Player ${nextPlayer}'s turn.`
		}

		// Show/hide rematch and queue/home controls when the game is finished
		const finished = Boolean(winner) || Boolean(isTie)
		this.rematchButton.disabled = !finished || isBusy
		this.queueButton.disabled = !finished || isBusy
		this.homeButton.disabled = isBusy
		this.leaveButton.disabled = isBusy
		this.resetButton.disabled = isBusy
	}

	setBusy(isBusy) {
		this.leaveButton.disabled = isBusy
		this.resetButton.disabled = isBusy
	}

	setHidden(isHidden) {
		this.root.classList.toggle('ttt-hidden', isHidden)
	}
}