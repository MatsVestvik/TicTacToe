let stylesInjected = false

export function injectStyles() {
	if (stylesInjected) {
		return
	}

	stylesInjected = true

	const styleElement = document.createElement('style')
	styleElement.textContent = `
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

		.ttt-shell {
			width: min(100%, 420px);
		}

		.ttt-title {
			margin: 0 0 12px;
		}

		.ttt-subtitle,
		.ttt-copy,
		.ttt-status {
			margin: 0;
			line-height: 1.4;
		}

		.ttt-section {
			margin-top: 16px;
		}

		.ttt-buttons {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
			margin-top: 12px;
		}

		.ttt-button {
			font: inherit;
			padding: 0.6rem 0.9rem;
			border: 1px solid #000;
			background: #fff;
			color: #000;
			cursor: pointer;
		}

		.ttt-button:disabled {
			cursor: not-allowed;
			opacity: 0.6;
		}

		.ttt-board {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 8px;
			margin-top: 12px;
		}

		.ttt-cell {
			aspect-ratio: 1 / 1;
			font-size: 2rem;
			font-weight: 700;
		}

		.ttt-hidden {
			display: none;
		}
	`
	document.head.append(styleElement)
}