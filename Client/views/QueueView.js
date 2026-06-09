export class QueueView {
	constructor({ onLeave }) {
		this.root = document.createElement('section')
		this.root.className = 'ttt-section'

		this.statusElement = document.createElement('p')
		this.statusElement.className = 'ttt-status'

		const buttons = document.createElement('div')
		buttons.className = 'ttt-buttons'

		this.leaveButton = document.createElement('button')
		this.leaveButton.type = 'button'
		this.leaveButton.className = 'ttt-button'
		this.leaveButton.textContent = 'Leave queue'
		this.leaveButton.addEventListener('click', onLeave)

		buttons.append(this.leaveButton)
		this.root.append(this.statusElement, buttons)
	}

	setState(queuePosition) {
		this.statusElement.textContent = queuePosition
			? `You are in the queue. Position ${queuePosition}.`
			: 'You are in the queue.'
	}

	setBusy(isBusy) {
		this.leaveButton.disabled = isBusy
	}

	setHidden(isHidden) {
		this.root.classList.toggle('ttt-hidden', isHidden)
	}
}