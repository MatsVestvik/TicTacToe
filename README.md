# TicTacToe

This is a simple tic-tac-toe game for the browser.

## Modes

- Multiplayer: joins a queue until another player is matched, then both players share one board.
- Singleplayer: placeholder for later.
- Local: placeholder for later.

## Multiplayer flow

1. Open the deployed frontend on two devices.
2. Choose Multiplayer on both devices.
3. The first player waits in the queue until the second player joins.
4. Once matched, the two players play on the same board.

The frontend talks to the Render backend URL from `Client/index.html`.