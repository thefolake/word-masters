/* 
Write the HTML. Get all the divs and such that you'll need. Make sure to link a stylesheet and a script to run your CSS and JS
Style it. Write the CSS to get to the state where everything looks right.
Starting on the JS, get the core mechanic of typing down. You'll have to handle
Handle a keystroke with a letter.
Handle a wrong keystroke (like a number or spacebar). Ignore it.
Handle "Enter" when the word is complete (go to the next line)
Handle "Enter" when the word is incomplete (ignore it)
Handle "Backspace" when there's a letter to delete
Handle "Backspace" when there's no letter to delete
Handle the API request to get the word of the day
Handle checking just if the word submitted after a user hits enter is the word is the word of the day
Handle the "win" condition (I'd just start with alert('you win')))
Handle the "lose" condition (I'd just start with alert('you lose, the word was ' + word)))
Handle the guess's correct letter in the correct space (the green squares)
Handle the guess's wrong letters outright (the gray squares)
Handle the yellow squares
Handle the correct letters, wrong space (the yellow squares) naïvely. If a word contains the letter at all but it's in the wrong square, just mark it yellow.
Handle the yellow squares correctly. For example, if the player guesses "SPOOL" and the word is "OVERT", one "O" is shown as yellow and the second one is not. Green squares count too.
Add some indication that a user needs to wait for you waiting on the API, some sort of loading spinner.
Add the second API call to make sure a user is requesting an actual word.
Add some visual indication that the user guessed something isn't an actual word (I have the border flash red on the current line)
Add some fun animation for a user winning (I have the Word Masters brand flash rainbow colors)

*/

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

const letters = document.querySelectorAll('.letter');
const ANSWER_LENGTH = 5;
const ROUNDS = 6;
const loader = document.querySelector('.loader-container');


async function init() {
    let currentGuess = '';
    let currentRow = 0;
    let done = false;
    let isLoading = true;


    const response = await fetch('https://words.dev-apis.com/word-of-the-day');
    const resObj = await response.json()
    const word = resObj.word.toUpperCase();
    const wordParts = word.split("");
    isLoading = false;
    setLoading(isLoading);
     console.log({wordParts, isLoading});
    


    const addLetter = (letter) => {
        //function to add letter to the first row
        //I have currentGuess to keep track of each letter
        //Now when I type, I want it to be filled with letters
        //theres a clause, if youve typed last letter in the box, even if you dont backspace but you type another letter itll be switched woiyh the new letter you typed

        if(currentGuess.length < ANSWER_LENGTH) {
            //add letter to the end
            currentGuess += letter
            // console.log({currentGuess, letter})
        } else {
            //replaces last letter in the row
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter
        }

        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter
    };

     const commit = async () => {
        if(currentGuess.length !== ANSWER_LENGTH) {
            return;
        }

        //TODO
        //validate word 
        isLoading = true;
        setLoading(isLoading);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
        method: "POST",
        body: JSON.stringify({ word: currentGuess }),
        });
        const { validWord } = await res.json();
        isLoading = false;
        setLoading(isLoading);

        // not valid, mark the word as invalid and return
        if (!validWord) {
        markInvalidWord();
        return;
        }
        //show as "correct", "close" or "wrong"

        const splitGuess = currentGuess.split('');
        const map = makeMap(wordParts);

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            //mark as correct
            if (splitGuess[i] === wordParts[i]) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add('correct')
                map[splitGuess[i]]--;
            }
        }
        //Did they win or lose?

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (splitGuess[i] === wordParts[i]) {
                //do nothing
            } else if(wordParts.includes(splitGuess[i]) && map[splitGuess[i]] > 0) {
                 letters[currentRow * ANSWER_LENGTH + i].classList.add('close')
                 map[splitGuess[i]]--;
            } else {
                 letters[currentRow * ANSWER_LENGTH + i].classList.add('wrong')
            }
        }
        currentRow++

        if (currentGuess === word) {
            //win
            alert('you win');
            document.querySelector('.wordle').classList.add('winner')
            done = true;
            return;
        } else if (currentRow === ROUNDS){
            alert(`you loose, the word was ${word}`);
            done = true;
        }
        currentGuess = ''
        
    }

    const backSpace = () => {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        console.log({currentGuess})

        letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = ''
    }

    const markInvalidWord = () => {
        for (let i = 0; i< ANSWER_LENGTH; i++) {
            letters[currentRow * ANSWER_LENGTH + i].classList.remove('invalid')
            setTimeout(() => {
            letters[currentRow * ANSWER_LENGTH + i].classList.add('invalid');
            }, 10)
        }
    };

    document.addEventListener('keydown', function (e) {
        console.log({done, isLoading})
        if(done || isLoading ) {
            return
        }

        console.log(e.key);
        const key = e.key;

        if(key === 'Enter') {
            commit();
        } else if (key === 'Backspace') {
            backSpace();
        } else if (isLetter(key)) {
            addLetter(key.toUpperCase())
        }
    })
};

function setLoading (isLoading) {
    loader.classList.toggle('show', isLoading)
}

//check array if it contains more than one of the same letter
function makeMap (array) {
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

init();