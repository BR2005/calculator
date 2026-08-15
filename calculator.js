(() => {
  const displayEl = document.getElementById('display')
  let current = ''
  let previous = ''
  let operation = null

  function updateDisplay() {
    displayEl.textContent = current === '' ? '0' : current
  }

  function appendNumber(n) {
    if (n === '.' && current.includes('.')) return
    current = current === '0' && n !== '.' ? n : current + n
    updateDisplay()
  }

  function chooseOperation(op) {
    if (current === '') return
    if (previous !== '') compute()
    operation = op
    previous = current
    current = ''
  }

  async function compute() {
    if (previous === '' || current === '') return
    const a = parseFloat(previous)
    const b = parseFloat(current)
    try {
      const resp = await fetch('/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a, b, op: operation })
      })
      const data = await resp.json()
      if (!resp.ok || data.error) {
        current = 'Error'
      } else {
        current = String(data.result)
      }
    } catch (err) {
      current = 'Error'
    }
    operation = null
    previous = ''
    updateDisplay()
  }

  function clearAll() {
    current = ''
    previous = ''
    operation = null
    updateDisplay()
  }

  function del() {
    current = current.slice(0, -1)
    updateDisplay()
  }

  function percent() {
    if (current === '') return
    current = String(parseFloat(current) / 100)
    updateDisplay()
  }

  document.addEventListener('click', (e) => {
    const t = e.target
    if (t.matches('button.number')) {
      appendNumber(t.textContent)
    } else if (t.matches('button.op')) {
      chooseOperation(t.dataset.op)
    } else if (t.matches('button.func')) {
      const action = t.dataset.action
      if (action === 'clear') clearAll()
      else if (action === 'del') del()
      else if (action === 'percent') percent()
      else if (action === 'equals') compute()
    }
  })

  // keyboard support
  window.addEventListener('keydown', (e) => {
    if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
      appendNumber(e.key)
    } else if (['+','-','*','/'].includes(e.key)) {
      chooseOperation(e.key)
    } else if (e.key === 'Enter') {
      e.preventDefault(); compute()
    } else if (e.key === 'Backspace') {
      del()
    } else if (e.key.toLowerCase() === 'c') {
      clearAll()
    }
  })

  // initialize
  clearAll()
})()
