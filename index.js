async function init() {

    // Variables
    let currentGuess = '';
    let currentRow = 0;
    let isGameOver = false;
    let isLoading = true;
    let lettersOfWordOfTheDay;

    const ANSWER_LENGTH = 5;
    const GAME_ROUNDS = 6;

    let wordOfTheDay = '';

    //UI Elements
    const letters = document.querySelectorAll('.letter');
    const loader = document.querySelector('.loader-container');
    const alertElement = document.querySelector('.alert');
    const modal = document.querySelector('#word-masters-dialog');
    const gameInstructionBtn = document.querySelector('#game-instructions');
    const closeModalBtn = document.querySelector('#close-modal');


    /**  ====== start loader controls ========= */
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
    /**  ====== end loader controls ========= */


    /**  ====== start alert controls ========= */

    const displayAlert = (innerText, className) => {
        alertElement.classList.remove('hidden');
        alertElement.innerText = innerText;
        alertElement.classList.add(className);
    }

    const successAlert = (message) => {
        displayAlert(message, 'correct')
    };

    const errorAlert = (message) => {
        displayAlert(message, 'error-alert')
    };

    /**  ====== end alert controls ========= */



    /** ==== start letter box display state modifiers ===  */

    const getLetterElement = (letterElementRow, letterElementIndexOnRow) => {
        return letters[letterElementRow * ANSWER_LENGTH + letterElementIndexOnRow];
    }

    const showInvalidWord = () => {
        const invalidLetterClassName = "invalid";
        for (let i = 0; i< ANSWER_LENGTH; i++) {
            const letterElementIndexOnRow = i;
            const elLetterBox = getLetterElement(currentRow, letterElementIndexOnRow);
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
        getLetterElement(currentRow, currentGuess.length).innerText = '';
    }

    const addLetterToGuess = (letter) => {
        let updatedGuess = updateCurrentGuess(letter);
        getLetterElement(currentRow, updatedGuess.length - 1).innerText = letter;
    };

    /** ==== end guess content modifiers ===  */


    /** start wordle API integrations */

    const WORDLE_BASE_URL = 'https://words.dev-apis.com';
    const WORD_OF_THE_DAY_URL = WORDLE_BASE_URL + "/word-of-the-day";
    const WORD_VALIDATION_URL = WORDLE_BASE_URL + "/validate-word";

    const getWordOfTheDay = async () => {
        showLoader();
        try {
            let wordOfTheDayResponse = await fetch(WORD_OF_THE_DAY_URL);
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
        try {
            const res = await fetch(WORD_VALIDATION_URL, {
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

    /** end wordle API integrations */


    const validateLetterMatches = () => {
        //mark as correct, wrong or close
        const splitGuess = currentGuess.split('');
        const map = countLetterOccurences(lettersOfWordOfTheDay);
        let isCorrectGuess = true;

        splitGuess.forEach((letter, index) => {
            if (letter === lettersOfWordOfTheDay[index]) {
                showRightLetterInRightPosition(currentRow, index);
                map[letter]--;
            } else {
                isCorrectGuess = false;
            }
        });

        splitGuess.forEach((letter, index) => {
            if (letter !== lettersOfWordOfTheDay[index]) {
                if (map[letter] > 0) {
                    showRightLetterInWrongPosition(currentRow, index);
                    map[letter]--;
                } else {
                    showWrongLetter(currentRow, index);
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

    wordOfTheDay = await getWordOfTheDay();

    if(wordOfTheDay) lettersOfWordOfTheDay = wordOfTheDay.split('');

    const handleSubmit = async () => {
        if(currentGuess.length !== ANSWER_LENGTH) {
            return;
        }

        const validateGuess = await validateWord();
        if (!validateGuess) {
            showInvalidWord();
            return
        }

        const isCorrect = validateLetterMatches();

        // move this function to showGameResult
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
        // end of showGameResult


        currentGuess = ''

    }

    document.addEventListener('keydown', function (e) {
        if(isGameOver || isLoading ) {
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

    gameInstructionBtn.addEventListener('click', () => {
        modal.showModal();
    })

    closeModalBtn.addEventListener('click', () => {
        modal.close();
    })

};

window.onload = (event) => {
    init();
};