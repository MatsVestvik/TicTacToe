const boardElement = document.querySelector('#board')
const statusElement = document.querySelector('#status')
const resetButton = document.querySelector('#reset-button')

const state = {
  board: Array(9).fill(''),
  humanSymbol: 'X',
  botSymbol: 'O',
  winner: null,
  turn: 'human',
  busy: false,
  error: '',
}

function cellLabel(value, index) {
  return value || `Cell ${index + 1}`
}

function winnerText(winner) {
  if (!winner) {
    return 'Your turn'
  }
  if (winner === 'draw') {
    return "It's a draw."
  }
  return `${winner} wins.`
}

function render() {
  boardElement.innerHTML = ''

  state.board.forEach((value, index) => {
    const cell = document.createElement('button')
    cell.type = 'button'
    cell.className = `cell ${value ? `cell-${value.toLowerCase()}` : ''}`
    cell.textContent = value
    cell.setAttribute('role', 'gridcell')
    cell.setAttribute('aria-label', cellLabel(value, index))
    cell.disabled = state.busy || Boolean(value) || Boolean(state.winner)
    cell.addEventListener('click', () => playMove(index))
    boardElement.appendChild(cell)
  })

  const turnText = state.error
    ? state.error
    : state.winner
      ? winnerText(state.winner)
      : state.busy
        ? 'Thinking...'
        : 'Your turn'

  statusElement.textContent = `${turnText} You are ${state.humanSymbol}, bot is ${state.botSymbol}.`
}

async function loadNewGame() {
  state.busy = true
  render()

  const response = await fetch('/api/new-game')
  const data = await response.json()

  state.board = data.board
  state.humanSymbol = data.human_symbol
  state.botSymbol = data.bot_symbol
  state.turn = data.turn
  state.winner = data.winner
  state.error = ''
  state.busy = false
  render()
}

async function playMove(index) {
  if (state.busy || state.winner || state.board[index]) {
    return
  }

  state.busy = true
  state.error = ''
  render()

  try {
    const response = await fetch('/api/play', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        board: state.board,
        human_move: index,
        human_symbol: state.humanSymbol,
        bot_symbol: state.botSymbol,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Move rejected')
    }

    state.board = data.board
    state.turn = data.turn
    state.winner = data.winner
  } catch (error) {
    state.error = error.message
  } finally {
    state.busy = false
    render()
  }
}

resetButton.addEventListener('click', loadNewGame)

loadNewGame().catch((error) => {
  state.error = `Failed to start game: ${error.message}`
  state.busy = false
  render()
})