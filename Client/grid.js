export class Grid {
	constructor(parentElement) {
		this.parentElement = parentElement
	}

	render() {
		const gridElement = document.createElement('section')
		gridElement.className = 'grid'
		gridElement.setAttribute('aria-label', 'TicTacToe grid')

		const cellLabels = [
			'Top left cell',
			'Top center cell',
			'Top right cell',
			'Middle left cell',
			'Center cell',
			'Middle right cell',
			'Bottom left cell',
			'Bottom center cell',
			'Bottom right cell',
		]

		for (const label of cellLabels) {
			const cellButton = document.createElement('button')
			cellButton.className = 'grid-cell'
			cellButton.type = 'button'
			cellButton.setAttribute('aria-label', label)
			gridElement.appendChild(cellButton)
		}

		this.parentElement.replaceChildren(gridElement)
	}
}