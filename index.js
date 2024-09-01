// Variables
let currentGuess = '';
let currentRow = 0;
let isGameOver = false;
let isLoading = true;
let lettersOfWordOfTheDay;
let wordOfTheDay;
const ANSWER_LENGTH = 5;
const GAME_ROUNDS = 6;

//UI Elements
const letters = document.querySelectorAll('.letter');
const loader = document.querySelector('.loader-container');
const alertElement = document.querySelector('.alert');
const modal = document.querySelector('#word-masters-dialog');
const gameInstructionBtn = document.querySelector('#game-instructions');
const closeModalBtn = document.querySelector('#close-modal');


const isLetter = (letter) => {
    return /^[a-zA-Z]$/.test(letter);
}

const setLoading = (newLoadingState) => {
    isLoading = newLoadingState;
    loader.classList.toggle('show', isLoading);
}

const showLoader = () => {
    setLoading(true);
}

const hideLoader = () => {
    setLoading(false);
}

const displayAlert = (innerText, className) => {
    alertElement.classList.remove('hidden');
    alertElement.innerText = innerText;
    alertElement.classList.add(className);
}

const successAlert = (message) => {
    displayAlert(message, 'correct')
};

//TODO fxn to help reuse letters[ANSWER_LENGTH ...]
/*
  similar to what im doing here,
    const setCurrentGuessInDOM = (row, letterIndex, letter) => {
        letters[ANSWER_LENGTH * row + letterIndex].innerText = letter;
    };
    but now making it reusable
 */
const modifyLetter = (row, index, action, value = '') => {
    const letterElement = letters[row * ANSWER_LENGTH + index];

    switch (action) {
        case 'addClass':
            letterElement.classList.add(value);
            break;
        case 'removeClass':
            letterElement.classList.remove(value);
            break;
        case 'setText':
            letterElement.innerText = value;
            break;
        case 'clearText':
            letterElement.innerText = '';
            break;
        default:
            break;
    }
}

const errorAlert = (message) => {
    displayAlert(message, 'error-alert')
};

const getWordOfTheDay = async () => {
    showLoader();
    let wordOfTheDayApiUrl = 'https://words.dev-apis.com/word-of-the-day';
    try {
        let wordOfTheDayResponse = await fetch(wordOfTheDayApiUrl);
        const responseObj = await wordOfTheDayResponse?.json()
        wordOfTheDay = responseObj?.word?.toUpperCase();
    } catch (error) {
        console.log(error);
        errorAlert(`${error.message || 'An error occured, please try again'}`);
    } finally {
        hideLoader();
    }
    return wordOfTheDay
};

const validateWord = async () => {
    showLoader();

    let validateWordApiUrl = 'https://words.dev-apis.com/validate-word';

    try {
        const res = await fetch(validateWordApiUrl, {
            method: "POST",
            body: JSON.stringify({ word: currentGuess }),
        });
        const { validWord } = await res.json();
        return validWord
    } catch (error) {
        console.log(error);
        errorAlert(`${error || 'An error occured, please try again'}`);
    } finally {
        hideLoader();
    }
}

const validateLetterMatches = () => {
    //mark as correct, wrong or close
    const splitGuess = currentGuess.split('');
    const map = countLetterOccurences(lettersOfWordOfTheDay);
    let isCorrectGuess = true;

    splitGuess.forEach((letter, index) => {
        if (letter === lettersOfWordOfTheDay[index]) {
            modifyLetter(currentRow, index, 'addClass', 'correct');
            map[letter]--;
        } else {
            isCorrectGuess = false;
        }
    });

    splitGuess.forEach((letter, index) => {
        if (letter !== lettersOfWordOfTheDay[index]) {
            if (map[letter] > 0) {
                modifyLetter(currentRow, index, 'addClass', 'close');
                map[letter]--;
            } else {
                modifyLetter(currentRow, index, 'addClass', 'wrong');
            }
        }
    });

    currentRow++;

    return isCorrectGuess;
}

const updateCurrentGuess = (letter) => {

    if(currentGuess.length < ANSWER_LENGTH) {
        currentGuess += letter
    } else {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter
    }
    return currentGuess;
};

const countLetterOccurences = (array) => {
    const obj = {}
    for(let i = 0; i < array.length; i++) {
        const letter = array[i]
        if (obj[letter]) {
            obj[letter]++
        } else {
            obj[letter] = 1;
        }
    }
    return obj
}

async function init() {
    const wordOfTheDay = await getWordOfTheDay();

    if(wordOfTheDay) lettersOfWordOfTheDay = wordOfTheDay.split('');


    const addLetterToGuess = (letter) => {
        let updatedGuess = updateCurrentGuess(letter);
        modifyLetter(currentRow, updatedGuess.length - 1, 'setText', letter );
    };

    const handleSubmit = async () => {
        if(currentGuess.length !== ANSWER_LENGTH) {
            return;
        }

        const validateGuess = await validateWord();
        if (!validateGuess) {
            markInvalidWord();
            return
        }

        const isCorrect = validateLetterMatches();
        if (isCorrect) {
            document.querySelector('.wordle').classList.add('winner');
            successAlert('You win');
            gameInstructionBtn.remove();
            isGameOver = true;
            return;
        } else if (currentRow === GAME_ROUNDS){
            errorAlert(`You loose, the word was ${wordOfTheDay}`);
            isGameOver = true
        }
        currentGuess = ''

    }

    const backSpace = () => {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);

        modifyLetter(currentRow, currentGuess.length, 'clearText')
    }

    const markInvalidWord = () => {
        for (let i = 0; i< ANSWER_LENGTH; i++) {
            modifyLetter(currentRow, i, 'removeClass', 'invalid');
            setTimeout(() => {
                modifyLetter(currentRow, i, 'addClass', 'invalid');
            }, 10)
        }
    };

    document.addEventListener('keydown', function (e) {
        if(isGameOver || isLoading ) {
            return
        }

        const key = e.key;

        if(key === 'Enter') {
            handleSubmit();
        } else if (key === 'Backspace') {
            backSpace();
        } else if (isLetter(key)) {
            addLetterToGuess(key.toUpperCase())
        }
    });

    gameInstructionBtn.addEventListener('click', () => {
        modal.showModal();
    })

    closeModalBtn.addEventListener('click', () => {
        modal.close();
    })
};

init();