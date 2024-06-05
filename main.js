import './style.css'

const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => document.querySelectorAll(selector)

const SUCCESS_CLASS = 'success'
const ERROR_CLASS = 'error'
const FLIPPED_CLASS = 'flipped'
const TIMEOUT = 2_000
const MAX_ATTEMPTS = 15

let correctNumbers = []
let selectedNumbers = []
let randomNumbers = generateNumber(10)
let attempts = MAX_ATTEMPTS

const $container = $('#container')
const $svg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M0 0h24v24H0z" stroke="none"/><path d="M19.875 6.27c.7.398 1.13 1.143 1.125 1.948v7.284c0 .809-.443 1.555-1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1-2.184 0l-6.75-4.27A2.225 2.225 0 0 1 3 15.502V8.217c0-.809.443-1.554 1.158-1.947l6.75-3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033zM12 16v.01"/><path d="M12 13a2 2 0 0 0 .914-3.782 1.98 1.98 0 0 0-2.414.483"/></svg>'

function generateNumber(length) {
  return Array.from({ length }, (_, i) => i + 1)
    .reduce((acc, el) => {
      acc.push(el, el)
      return acc
    }, [])
    .sort(() => Math.random() - 0.5)
}

function spanFactory(text) {
  const $span = document.createElement('span')

  $span.innerHTML = text

  return $span
}

function buttonFactory() {
  const $button = document.createElement('button')

  $button.innerHTML = $svg
  $button.onclick = () => {
    const $slot = $button.parentElement
    const index = $slot.dataset.index
    const number = randomNumbers[index]

    selectedNumbers.push({
      number,
      index
    })
    $slot.classList.add(FLIPPED_CLASS)
    $slot.replaceChild(spanFactory(number), $button)

    if (selectedNumbers.length === 2) {
      const $buttons = $$('.slot button')
      $buttons.forEach(($button) => ($button.disabled = true))

      const [first, second] = selectedNumbers

      if (first.number !== second.number) {
        attempts--
        $('#attempts').innerHTML = attempts
      }

      selectedNumbers.forEach(({ index }) => {
        $(`.slot[data-index="${index}"]`).classList.add(
          first.number === second.number ? SUCCESS_CLASS : ERROR_CLASS
        )
      })

      const action =
        first.number === second.number
          ? ($slot) => {
              correctNumbers.push(selectedNumbers)
              $slot.classList.remove(SUCCESS_CLASS)
            }
          : ($slot) => {
              $slot.classList.remove(FLIPPED_CLASS, ERROR_CLASS)
              $slot.replaceChild(buttonFactory(), $slot.firstChild)
            }

      setTimeout(() => {
        selectedNumbers.forEach(({ index }) => {
          action($(`.slot[data-index="${index}"]`))
        })

        if (correctNumbers.length === randomNumbers.length) {
          $('#board').style.display = 'none'
          $('#win-dialog').style.display = 'flex'

          return
        }

        if (attempts === 0) {
          $('#board').style.display = 'none'
          $('#lose-dialog').style.display = 'flex'

          return
        }

        selectedNumbers = []
        $buttons.forEach(($button) => ($button.disabled = false))
      }, TIMEOUT)
    }
  }
  return $button
}

function renderRandomNumbers() {
  randomNumbers.forEach((_, index) => {
    const $slot = document.createElement('div')

    $slot.classList.add('slot')
    $slot.dataset.index = index
    $slot.appendChild(buttonFactory())
    $container.appendChild($slot)
  })
}

$$('.try-again-button').forEach(($button) => {
  $button.addEventListener('click', () => {
    correctNumbers = []
    selectedNumbers = []
    attempts = MAX_ATTEMPTS
    randomNumbers = generateNumber(10)

    $container.innerHTML = ''
    renderRandomNumbers()

    $('#attempts').innerHTML = attempts
    $('#win-dialog').style.display = 'none'
    $('#lose-dialog').style.display = 'none'
    $('#board').style.display = 'block'
  })
})

renderRandomNumbers()

$('#attempts').innerHTML = attempts
