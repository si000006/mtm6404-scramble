/**********************************************
 * STARTER CODE
 **********************************************/

/**
 * shuffle()
 * Shuffle the contents of an array
 *   depending the datatype of the source
 * Makes a copy. Does NOT shuffle the original.
 * Based on Steve Griffith's array shuffle prototype
 * @Parameters: Array or string
 * @Return: Scrambled Array or string, based on the provided parameter
 */
function shuffle (src) {
  const copy = [...src]

  const length = copy.length
  for (let i = 0; i < length; i++) {
    const x = copy[i]
    const y = Math.floor(Math.random() * length)
    const z = copy[y]
    copy[i] = z
    copy[y] = x
  }

  if (typeof src === 'string') {
    return copy.join('')
  }

  return copy
}

/**********************************************
 * YOUR CODE BELOW
 **********************************************/

const STORAGE_KEY = 'scramble-game'

const WORDS = [
  'react',
  'browser',
  'storage',
  'component',
  'javascript',
  'function',
  'element',
  'variable',
  'object',
  'array',
  'string',
  'module'
]

const MAX_STRIKES = 3
const MAX_PASSES = 3

function scrambleWord (word) {
  let scrambled = shuffle(word)

  // Try to avoid showing the exact same word when possible
  while (scrambled === word && word.length > 1) {
    scrambled = shuffle(word)
  }

  return scrambled
}

function createNewGame () {
  const shuffledWords = shuffle(WORDS)
  const currentWord = shuffledWords[0]

  return {
    remainingWords: shuffledWords.slice(1),
    currentWord,
    scrambledWord: scrambleWord(currentWord),
    guess: '',
    message: 'Type your guess and press Enter.',
    points: 0,
    strikes: 0,
    passes: MAX_PASSES,
    gameOver: false
  }
}

function App () {
  const [game, setGame] = React.useState(() => {
    const savedGame = localStorage.getItem(STORAGE_KEY)

    if (savedGame) {
      return JSON.parse(savedGame)
    }

    return createNewGame()
  })

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game))
  }, [game])

  function inputHandler (e) {
    const value = e.target.value

    setGame(prevGame => ({
      ...prevGame,
      guess: value
    }))
  }

  function nextWord (prevGame) {
    // No words left after this one
    if (prevGame.remainingWords.length === 0) {
      return {
        ...prevGame,
        currentWord: '',
        scrambledWord: '',
        guess: '',
        gameOver: true
      }
    }

    const next = prevGame.remainingWords[0]

    return {
      ...prevGame,
      currentWord: next,
      scrambledWord: scrambleWord(next),
      remainingWords: prevGame.remainingWords.slice(1),
      guess: ''
    }
  }

  function formHandler (e) {
    e.preventDefault()

    setGame(prevGame => {
      if (prevGame.gameOver) {
        return prevGame
      }

      const cleanedGuess = prevGame.guess.trim().toLowerCase()
      const answer = prevGame.currentWord.toLowerCase()

      // Empty guess still clears the box and gives feedback
      if (!cleanedGuess) {
        return {
          ...prevGame,
          guess: '',
          message: 'Please enter a guess.'
        }
      }

      if (cleanedGuess === answer) {
        const updatedGame = {
          ...prevGame,
          points: prevGame.points + 1,
          message: `"${cleanedGuess}" is correct!`,
          guess: ''
        }

        return nextWord(updatedGame)
      }

      const updatedStrikes = prevGame.strikes + 1

      if (updatedStrikes >= MAX_STRIKES) {
        return {
          ...prevGame,
          strikes: updatedStrikes,
          guess: '',
          message: `"${cleanedGuess}" is incorrect.`,
          gameOver: true
        }
      }

      return {
        ...prevGame,
        strikes: updatedStrikes,
        guess: '',
        message: `"${cleanedGuess}" is incorrect. Try again.`
      }
    })
  }

  function passHandler () {
    setGame(prevGame => {
      if (prevGame.gameOver || prevGame.passes <= 0) {
        return prevGame
      }

      const updatedGame = {
        ...prevGame,
        passes: prevGame.passes - 1,
        message: `Word passed. ${prevGame.passes - 1} pass(es) remaining.`,
        guess: ''
      }

      return nextWord(updatedGame)
    })
  }

  function restartHandler () {
    const newGame = createNewGame()
    setGame(newGame)
  }

  return (
    <main style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '40px auto',
      padding: '20px',
      lineHeight: '1.5'
    }}>
      <h1>Scramble</h1>

      <p>Unscramble the word and press Enter to guess.</p>

      <div style={{ marginBottom: '20px' }}>
        <p><strong>Scrambled word:</strong> {game.gameOver ? '-' : game.scrambledWord}</p>
        <p><strong>Points:</strong> {game.points}</p>
        <p><strong>Strikes:</strong> {game.strikes} / {MAX_STRIKES}</p>
        <p><strong>Passes:</strong> {game.passes}</p>
        <p><strong>Words left:</strong> {game.gameOver ? 0 : game.remainingWords.length + 1}</p>
      </div>

      {!game.gameOver && (
        <React.Fragment>
          <form onSubmit={formHandler} style={{ marginBottom: '15px' }}>
            <input
              type="text"
              value={game.guess}
              onChange={inputHandler}
              placeholder="Enter your guess"
              style={{
                padding: '8px',
                width: '250px',
                marginRight: '10px'
              }}
            />
            <button type="submit" style={{ padding: '8px 12px' }}>
              Guess
            </button>
          </form>

          <button
            type="button"
            onClick={passHandler}
            disabled={game.passes <= 0}
            style={{ padding: '8px 12px', marginBottom: '15px' }}
          >
            Pass
          </button>
        </React.Fragment>
      )}

      <p><strong>Message:</strong> {game.message}</p>

      {game.gameOver && (
        <section style={{ marginTop: '20px' }}>
          <h2>Game Over</h2>

          {game.strikes >= MAX_STRIKES ? (
            <p>You reached the maximum number of strikes.</p>
          ) : (
            <p>You made it through the word list.</p>
          )}

          <p>Your final score is {game.points}.</p>

          <button
            type="button"
            onClick={restartHandler}
            style={{ padding: '8px 12px' }}
          >
            Play Again
          </button>
        </section>
      )}
    </main>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)