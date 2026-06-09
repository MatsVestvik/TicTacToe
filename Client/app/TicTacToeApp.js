import { getApiBaseUrl } from '../core/apiConfig.js'
import { getOrCreateClientId } from '../core/clientIdentity.js'
import { MultiplayerApi } from '../services/MultiplayerApi.js'
import { GameView } from '../views/GameView.js'
import { MenuView } from '../views/MenuView.js'
import { QueueView } from '../views/QueueView.js'

export class TicTacToeApp {
	constructor(rootElement) {
		this.rootElement = rootElement
		this.api = new MultiplayerApi(getApiBaseUrl())
		this.clientId = getOrCreateClientId()
		this.scene = 'menu'
		this.isBusy = false
		this.multiplayerState = {
			state: 'idle',
			symbol: null,
			queuePosition: null,
			match: null,
		}

		this.shell = document.createElement('main')
		this.shell.className = 'ttt-shell'

		this.title = document.createElement('h1')
		this.title.className = 'ttt-title'
		this.title.textContent = 'Tic Tac Toe'

		this.subtitle = document.createElement('p')
		this.subtitle.className = 'ttt-subtitle'
		this.subtitle.textContent = 'Choose a mode to start.'

		this.menuView = new MenuView({
			onMultiplayer: () => this.joinMultiplayer(),
			onSingleplayer: () => this.showComingSoon('Singleplayer will be added later.'),
			onLocal: () => this.showComingSoon('Local play will be added later.'),
		})

		this.queueView = new QueueView({
			onLeave: () => this.leaveMultiplayer(),
		})

		this.gameView = new GameView({
			onMove: (index) => this.playMove(index),
			onLeave: () => this.leaveMultiplayer(),
			onReset: () => this.resetBoard(),
			onHome: () => this.leaveMultiplayer(),
			onQueue: () => this.queueFromGame(),
		})

		this.shell.append(this.title, this.subtitle, this.menuView.root, this.queueView.root, this.gameView.root)
	}

	start() {
		this.rootElement.replaceChildren(this.shell)
		this.render()
		this.loadMultiplayerState()
		this.pollTimer = window.setInterval(() => this.loadMultiplayerState(), 2000)
	}

	stop() {
		if (this.pollTimer) {
			window.clearInterval(this.pollTimer)
			this.pollTimer = undefined
		}
	}

	setScene(nextScene) {
		this.scene = nextScene
		this.render()
	}

	showComingSoon(message) {
		this.subtitle.textContent = message
	}

	render() {
		this.menuView.setHidden(this.scene !== 'menu')
		this.queueView.setHidden(this.scene !== 'queue')
		this.gameView.setHidden(this.scene !== 'game')

		this.menuView.setBusy(this.isBusy)
		this.queueView.setBusy(this.isBusy)
		this.gameView.setBusy(this.isBusy)

		if (this.scene === 'menu') {
			this.subtitle.textContent = 'Choose a mode to start.'
		}

		if (this.scene === 'queue') {
			this.subtitle.textContent = 'Waiting to be matched with another player.'
			this.queueView.setState(this.multiplayerState.queuePosition)
		}

		if (this.scene === 'game') {
			this.subtitle.textContent = 'Multiplayer match.'
			this.gameView.render(this.multiplayerState, this.isBusy)
		}
	}

	updateSceneFromState() {
		if (this.multiplayerState.state === 'queued') {
			this.setScene('queue')
			return
		}

		if (this.multiplayerState.state === 'matched' || this.multiplayerState.state === 'finished') {
			this.setScene('game')
			return
		}

		this.setScene('menu')
	}

	async joinMultiplayer() {
		this.isBusy = true
		this.render()

		try {
			const response = await this.api.join(this.clientId)
			this.multiplayerState = response.status || this.multiplayerState
			this.updateSceneFromState()
		} catch (error) {
			this.subtitle.textContent = 'Could not join multiplayer.'
		} finally {
			this.isBusy = false
			this.render()
		}
	}

	async leaveMultiplayer() {
		this.isBusy = true
		this.render()

		try {
			await this.api.leave(this.clientId)
			this.multiplayerState = {
				state: 'idle',
				symbol: null,
				queuePosition: null,
				match: null,
			}
			this.setScene('menu')
		} catch (error) {
			this.subtitle.textContent = 'Could not leave the match.'
		} finally {
			this.isBusy = false
			this.render()
		}
	}

	async loadMultiplayerState() {
		try {
			const response = await this.api.status(this.clientId)
			this.multiplayerState = response.status || this.multiplayerState
			this.updateSceneFromState()
		} catch (error) {
			if (this.scene !== 'menu') {
				this.setScene('menu')
			}
		} finally {
			this.render()
		}
	}

	async playMove(index) {
		if (!this.multiplayerState.symbol) {
			return
		}

		this.isBusy = true
		this.render()

		try {
			const response = await this.api.move(this.clientId, index)
			this.multiplayerState = response.status || this.multiplayerState
		} catch (error) {
			this.gameView.statusElement.textContent = 'Could not make that move.'
		} finally {
			this.isBusy = false
			this.render()
		}
	}

	async resetBoard() {
		this.isBusy = true
		this.render()

		try {
			const response = await this.api.reset(this.clientId)
			this.multiplayerState = response.status || this.multiplayerState
		} catch (error) {
			this.gameView.statusElement.textContent = 'Could not reset the board.'
		} finally {
			this.isBusy = false
			this.render()
		}

		async queueFromGame() {
			// leave current match then re-join the queue
			await this.leaveMultiplayer()
			await this.joinMultiplayer()
		}
	}
}