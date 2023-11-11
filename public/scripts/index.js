const DELAY = 1000
const MAX_EPIGRAMS = 5
let currentPage = 0

async function fetchEpigram() {
  try {
    const response = await fetch('/epigrams/random')
    if (!response.ok) {
      console.error('Failed to fetch epigram: HTTP status ', response.status)
      return null
    }
    const epigram = await response.json()
    return epigram
  } catch (error) {
    console.error('Failed to fetch epigram: ', error)
    return null
  }
}

async function fetchAllEpigrams() {
  try {
    const response = await fetch('/epigrams')
    if (!response.ok) {
      console.error('Failed to fetch all epigrams: HTTP status ', response.status)
      return null
    }
    const allEpigrams = await response.json()
    return allEpigrams.slice(MAX_EPIGRAMS * currentPage, MAX_EPIGRAMS * currentPage + MAX_EPIGRAMS)
  } catch (error) {
    console.error('Failed to fetch all epigrams:', error)
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
  element.style.fontStyle = 'normal'
  element.style.fontWeight = 'normal'
  element.style.textDecoration = 'none'

  switch (type) {
    case 'Weißheit':
      element.style.fontStyle = 'italic'
      break
    case 'Lustiger Spruch':
      element.style.fontWeight = 'bold'
      break
    case 'Lektion':
      element.style.textDecoration = 'underline'
      break
  }
}

function createEpigramElement(type, epigram) {
  const element = createElement(type, {}, epigram.value)
  setStyleBasedOnType(element, epigram.type)
  return element
}

function createForm(onSubmit) {
  const form = createElement('form')
  const typeLabel = createElement('label', {}, 'Type: ')
  const typeSelect = createElement('select', { name: 'type' })
  const jokeOption = createElement('option', { value: 'Lustiger Spruch' }, 'Lustiger Spruch')
  const quoteOption = createElement('option', { value: 'Weißheit' }, 'Weißheit')
  const lessonOption = createElement('option', { value: 'Lektion' }, 'Lektion')
  const valueLabel = createElement('label', {}, 'Value: ')
  const valueInput = createElement('input', { name: 'value' })
  const submitButton = createElement('button', { type: 'submit' }, 'Create')

  typeSelect.appendChild(jokeOption)
  typeSelect.appendChild(quoteOption)
  typeSelect.appendChild(lessonOption)

  const elements = [
    typeLabel,
    typeSelect,
    createElement('br'),
    createElement('br'),
    valueLabel,
    valueInput,
    createElement('br'),
    createElement('br'),
    submitButton,
  ]
  elements.forEach((element) => form.appendChild(element))

  form.onsubmit = async (event) => {
    event.preventDefault()
    onSubmit(typeSelect.value, valueInput.value)
  }

  return form
}

async function displayAllEpigrams(parent) {
  parent.innerHTML = ''
  let allEpigrams = await fetchAllEpigrams()
  if (allEpigrams) {
    for (const epigram of allEpigrams) {
      const listItem = createEpigramElement('li', epigram)
      parent.appendChild(listItem)
    }
  }
}

async function initialize() {
  const root = document.getElementById('root')

  let epigram = await fetchEpigram()
  if (!epigram) return
  let paragraph = createEpigramElement('p', epigram)
  root.appendChild(paragraph)

  setInterval(async () => {
    epigram = await fetchEpigram()
    if (!epigram) return
    paragraph.innerText = epigram.value
    setStyleBasedOnType(paragraph, epigram.type)
  }, DELAY)

  const list = createElement('ul', {})

  const form = createForm(async (type, value) => {
    try {
      const response = await fetch('/epigrams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, value }),
      })
      if (!response.ok) {
        console.error('Failed to post epigram: HTTP status', response.status)
        return
      }
      displayAllEpigrams(list)
    } catch (error) {
      console.error('Failed to post epigram:', error)
    }
  })

  root.appendChild(form)
  root.appendChild(list)

  displayAllEpigrams(list)

  const nextButton = createElement('button', {}, 'Next')
  nextButton.addEventListener('click', async () => {
    currentPage++
    displayAllEpigrams(list)
  })

  const prevButton = createElement('button', {}, 'Prev')
  prevButton.addEventListener('click', async () => {
    if (currentPage > 0) {
      currentPage--
      displayAllEpigrams(list)
    }
  })

  root.append(nextButton, prevButton)
}

window.addEventListener('load', initialize)
