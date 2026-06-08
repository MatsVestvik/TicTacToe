import { CounterView } from './grid.js'

const appElement = document.querySelector('#app')
const counterView = new CounterView(appElement)

counterView.render()