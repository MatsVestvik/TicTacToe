export class GameView {
	constructor({ onMove, onLeave, onReset }) {
		this.onMove = onMove
		this.root = document.createElement('section')
		this.root.className = 'ttt-section'

		this.statusElement = document.createElement('p')
		this.statusElement.className = 'ttt-status'

		const buttonRow = document.createElement('div')
		buttonRow.className = 'ttt-buttons'

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

		buttonRow.append(this.leaveButton, this.resetButton)

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
			this.statusElement.textContent = `Player ${winner} wins. You are ${symbol}.`
			return
		}

		if (isTie) {
			this.statusElement.textContent = `Tie game. You are ${symbol}.`
			return
		}

		this.statusElement.textContent = `You are ${symbol}. Player ${nextPlayer}'s turn.`
	}

	setBusy(isBusy) {
		this.leaveButton.disabled = isBusy
		this.resetButton.disabled = isBusy
	}

	setHidden(isHidden) {
		this.root.classList.toggle('ttt-hidden', isHidden)
	}
}