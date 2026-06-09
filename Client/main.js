import { TicTacToeApp } from './app/TicTacToeApp.js'

const appElement = document.querySelector('#app')

if (!appElement) {
	throw new Error('Missing #app element')
}

const app = new TicTacToeApp(appElement)
app.start()