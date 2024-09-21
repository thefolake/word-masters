
async function init() {

    // Variables
    let currentGuess = '';
    let currentRound = 0;
    let isGameOver = false;
    let lettersOfWordOfTheDay;

    const ANSWER_LENGTH = 5;
    const GAME_ROUNDS = 6;

    let wordOfTheDay = '';

    //UI Elements
    const lettersElement = document.querySelectorAll('.letter');
    const modalElement = document.querySelector('#word-masters-dialog');
    const gameInstructionBtnElement = document.querySelector('#game-instructions');
    const closeModalBtnElement = document.querySelector('#close-modal');
    const headingElement = document.querySelector('.heading')

    /** ==== start letter box display state modifiers ===  */
    const getLetterElement = (letterElementRow, letterElementIndexOnRow) => {
        return lettersElement[letterElementRow * ANSWER_LENGTH + letterElementIndexOnRow];
    }

    const showInvalidWord = () => {
        const invalidLetterClassName = "invalid";
        for (let i = 0; i< ANSWER_LENGTH; i++) {
            const elLetterBox = getLetterElement(currentRound, i);
            elLetterBox.classList.add(invalidLetterClassName);

            setTimeout(() => {
                elLetterBox.classList.remove(invalidLetterClassName);
            }, 3000)
        }
    }

    const showRightLetterInWrongPosition = (letterElementRow, letterElementIndexOnRow) => {
        getLetterElement(letterElementRow, letterElementIndexOnRow)
            .classList.add("close");
    }

    const showWrongLetter = (letterElementRow, letterElementIndexOnRow) => {
        getLetterElement(letterElementRow, letterElementIndexOnRow)
            .classList.add("wrong");
    }

    const showRightLetterInRightPosition = (letterElementRow, letterElementIndexOnRow) => {
        getLetterElement(letterElementRow, letterElementIndexOnRow)
            .classList.add("correct");
    }
    /** ==== end letter box display state modifiers ===  */

    /** ==== start guess content modifiers ===  */
    const deleteLastLetter = () => {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        getLetterElement(currentRound, currentGuess.length).innerText = '';
    }

    const addLetterToGuess = (letter) => {
        let updatedGuess = updateCurrentGuess(letter);
        getLetterElement(currentRound, updatedGuess.length - 1).innerText = letter;
    };
    /** ==== end guess content modifiers ===  */

    const validateGuessAndShowResult = () => {
        //mark as correct, wrong or close
        const splitGuess = currentGuess.split('');
        const letterOccurenceMap = getLetterAndOccurrenceMapFromWord(wordOfTheDay);
        let isCorrectGuess = true;

        splitGuess.forEach((letter, index) => {
            if (letter === lettersOfWordOfTheDay[index]) {
                showRightLetterInRightPosition(currentRound, index);
                letterOccurenceMap[letter]--;
            } else {
                isCorrectGuess = false;
            }
        });

        splitGuess.forEach((letter, index) => {
            if (letter !== lettersOfWordOfTheDay[index]) {
                if (letterOccurenceMap[letter] > 0) {
                    showRightLetterInWrongPosition(currentRound, index);
                    letterOccurenceMap[letter]--;
                } else {
                    showWrongLetter(currentRound, index);
                }
            }
        });

        currentRound++;

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

    const getLetterAndOccurrenceMapFromWord = (array) => {
        const letterOccurenceMap = {}
        for(const element of array) {
            const letter = element
            if (letterOccurenceMap[letter]) {
                letterOccurenceMap[letter]++
            } else {
                letterOccurenceMap[letter] = 1;
            }
        }
        return letterOccurenceMap
    }

    wordOfTheDay = await getWordOfTheDay(wordOfTheDay);

    if(wordOfTheDay) lettersOfWordOfTheDay = wordOfTheDay.split('');

    const handleSubmit = async () => {
        if(currentGuess.length !== ANSWER_LENGTH) {
            return;
        }

        const isValidWord = await validateWord(currentGuess);
        if (!isValidWord) {
            showInvalidWord();
            return
        }
        const isGuessValid = validateGuessAndShowResult();

        // TODO move this to a new function showCurrentRoundResult
        if (isGuessValid) {
            headingElement.classList.add('winner');
            successAlert('You win');
            gameInstructionBtnElement.remove();
            isGameOver = true;
        } else if (currentRound === GAME_ROUNDS){
            errorAlert(`You loose, the word was ${wordOfTheDay}`);
            isGameOver = true
        } else {
            currentGuess = ''
        }
        // end of showGameResult
    }

    document.addEventListener('keydown', function (e) {
        if(isGameOver || loadingState.isLoading ) {
            return
        }

        const key = e.key;

        if(key === 'Enter') {
            handleSubmit();
        } else if (key === 'Backspace') {
            deleteLastLetter();
        } else if (isLetter(key)) {
            addLetterToGuess(key.toUpperCase())
        }
    });

    gameInstructionBtnElement.addEventListener('click', () => {
        modalElement.showModal();
    })

    closeModalBtnElement.addEventListener('click', () => {
        modalElement.close();
    })

}

window.onload = (event) => {
    init();
};