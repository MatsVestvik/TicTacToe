export class CounterView {
  constructor(parentElement) {
    this.parentElement = parentElement
    this.valueElement = null
  }

  render() {
    const counterElement = document.createElement('section')
    counterElement.className = 'counter'

    const titleElement = document.createElement('h1')
    titleElement.className = 'counter-title'
    titleElement.textContent = 'Backend Counter'

    this.valueElement = document.createElement('p')
    this.valueElement.className = 'counter-label'
    this.valueElement.textContent = '...'

    const buttonElement = document.createElement('button')
    buttonElement.className = 'counter-button'
    buttonElement.type = 'button'
    buttonElement.textContent = 'Increment in backend'
    buttonElement.addEventListener('click', () => this.increment())

    counterElement.append(titleElement, this.valueElement, buttonElement)
    this.parentElement.replaceChildren(counterElement)

    this.loadValue()
  }

  async loadValue() {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/counter')
      const data = await response.json()
      this.valueElement.textContent = String(data.count)
    } catch {
      this.valueElement.textContent = 'Error'
    }
  }

  async increment() {
    this.valueElement.textContent = '...'

    try {
      const response = await fetch('http://127.0.0.1:5000/api/counter/increment', {
        method: 'POST',
      })
      const data = await response.json()
      this.valueElement.textContent = String(data.count)
    } catch {
      this.valueElement.textContent = 'Error'
    }
  }
}