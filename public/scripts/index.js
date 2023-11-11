const DELAY = 1000
const MAX_EPIGRAMS = 5
let currentPage = 0

async function fetchFromServer(url, options = {}) {
  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      console.error(`Failed to fetch from ${url}: HTTP status `, response.status)
      return null
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Failed to fetch from ${url}: `, error)
    return null
  }
}

function createElement(type, properties = {}, text = '') {
  const element = document.createElement(type)
  Object.assign(element, properties)
  element.innerText = text
  return element
}

function setStyleBasedOnType(element, type) {
  const styles = {
    Weißheit: { fontStyle: 'italic' },
    'Lustiger Spruch': { fontWeight: 'bold' },
    Lektion: { textDecoration: 'underline' },
  }

  Object.assign(element.style, {
    fontStyle: 'normal',
    fontWeight: 'normal',
    textDecoration: 'none',
    ...styles[type],
  })
}

function createEpigramElement(type, epigram) {
  const element = createElement(type, {}, epigram.value)
  setStyleBasedOnType(element, epigram.type)
  return element
}

function createForm(onSubmit) {
  const form = createElement('form')
  const typeOptions = ['Lustiger Spruch', 'Weißheit', 'Lektion']
  const typeSelect = createElement('select', { name: 'type' })
  typeOptions.forEach((option) =>
    typeSelect.appendChild(createElement('option', { value: option }, option)),
  )

  const elements = [
    createElement('label', {}, 'Type: '),
    typeSelect,
    createElement('br'),
    createElement('br'),
    createElement('label', {}, 'Value: '),
    createElement('input', { name: 'value' }),
    createElement('br'),
    createElement('br'),
    createElement('button', { type: 'submit' }, 'Create'),
  ]
  elements.forEach((element) => form.appendChild(element))

  form.onsubmit = async (event) => {
    event.preventDefault()
    onSubmit(typeSelect.value, form.elements['value'].value)
  }

  return form
}

async function displayAllEpigrams(parent) {
  parent.innerHTML = ''
  const allEpigrams = await fetchFromServer('/epigrams')
  if (allEpigrams) {
    allEpigrams
      .slice(MAX_EPIGRAMS * currentPage, MAX_EPIGRAMS * currentPage + MAX_EPIGRAMS)
      .forEach((epigram) => parent.appendChild(createEpigramElement('li', epigram)))
  }
}

async function initialize() {
  const root = document.getElementById('root')

  const form = createForm(async (type, value) => {
    const response = await fetchFromServer('/epigrams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, value }),
    })
    if (response) displayAllEpigrams(root.querySelector('ul'))
  })

  root.appendChild(form)
  root.appendChild(createElement('ul', {}))

  const epigram = await fetchFromServer('/epigrams/random')
  if (epigram) {
    const paragraph = createEpigramElement('p', epigram)
    root.appendChild(paragraph)

    setInterval(async () => {
      const newEpigram = await fetchFromServer('/epigrams/random')
      if (newEpigram) {
        paragraph.innerText = newEpigram.value
        setStyleBasedOnType(paragraph, newEpigram.type)
      }
    }, DELAY)
  }

  const buttonNames = ['Prev', 'Next']
  buttonNames.forEach((name, i) => {
    const button = createElement('button', {}, name)
    button.addEventListener('click', () => {
      // Decreases page number for previous button
      // Increases page number for next button
      currentPage = Math.max(0, currentPage + (i * 2 - 1))

      displayAllEpigrams(root.querySelector('ul'))
    })
    root.appendChild(button)
  })

  displayAllEpigrams(root.querySelector('ul'))
}

window.addEventListener('load', initialize)
