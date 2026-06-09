export class MenuView {
	constructor({ onMultiplayer, onSingleplayer, onLocal }) {
		this.root = document.createElement('section')
		this.root.className = 'ttt-section'

		const buttons = document.createElement('div')
		buttons.className = 'ttt-buttons'

		this.multiplayerButton = this.createButton('Multiplayer')
		this.singleplayerButton = this.createButton('Singleplayer (coming soon)', true)
		this.localButton = this.createButton('Local (coming soon)', true)

		this.multiplayerButton.addEventListener('click', onMultiplayer)
		this.singleplayerButton.addEventListener('click', onSingleplayer)
		this.localButton.addEventListener('click', onLocal)

		buttons.append(this.multiplayerButton, this.singleplayerButton, this.localButton)
		this.root.append(buttons)
	}

	createButton(label, disabled = false) {
		const button = document.createElement('button')
		button.type = 'button'
		button.className = 'ttt-button'
		button.textContent = label
		button.disabled = disabled
		return button
	}

	setBusy(isBusy) {
		this.multiplayerButton.disabled = isBusy
	}

	setHidden(isHidden) {
		this.root.classList.toggle('ttt-hidden', isHidden)
	}
}