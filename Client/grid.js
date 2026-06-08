export class CounterView {
  constructor(parentElement) {
    this.parentElement = parentElement
    this.valueElement = null
    this.statusElement = null
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

    this.statusElement = document.createElement('p')
    this.statusElement.className = 'counter-status'
    this.statusElement.textContent = 'Waiting for the backend.'

    const buttonElement = document.createElement('button')
    buttonElement.className = 'counter-button'
    buttonElement.type = 'button'
    buttonElement.textContent = 'Increment in backend'
    buttonElement.addEventListener('click', () => this.increment())

    counterElement.append(titleElement, this.valueElement, this.statusElement, buttonElement)
    this.parentElement.replaceChildren(counterElement)

    this.loadValue()
  }

  async loadValue() {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/counter')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      this.valueElement.textContent = String(data.count)
      this.statusElement.textContent = 'Loaded the current count from Python.'
    } catch (error) {
      this.valueElement.textContent = 'Error'
      this.statusElement.textContent = `Could not load from backend: ${error.message}`
    }
  }

  async increment() {
    this.valueElement.textContent = '...'
    this.statusElement.textContent = 'Sending increment request to Python...'

    try {
      const response = await fetch('http://127.0.0.1:5000/api/counter/increment', {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      this.valueElement.textContent = String(data.count)
      this.statusElement.textContent = data.message ?? 'Counter updated.'
    } catch (error) {
      this.valueElement.textContent = 'Error'
      this.statusElement.textContent = `Increment failed: ${error.message}. Make sure Flask is running on port 5000.`
    }
  }
}