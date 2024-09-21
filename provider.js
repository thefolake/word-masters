 /** start wordle API integrations */
    const WORDLE_BASE_URL = 'https://words.dev-apis.com';
    const WORD_OF_THE_DAY_URL = WORDLE_BASE_URL + "/word-of-the-day";
    const WORD_VALIDATION_URL = WORDLE_BASE_URL + "/validate-word";

    const getWordOfTheDay = async () => {
        showLoader();
        let wordOfTheDay = '';
        try {
            let wordOfTheDayResponse = await fetch(WORD_OF_THE_DAY_URL);
            const responseObj = await wordOfTheDayResponse?.json()
            wordOfTheDay = responseObj?.word?.toUpperCase();
        } catch (error) {
            console.log(error);
            errorAlert(`${error.message || 'An error occurred, please try again'}`);
        } finally {
            hideLoader();
        }
        return wordOfTheDay
    };

    const validateWord = async (currentGuess) => {
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
            errorAlert(`${error || 'An error occurred, please try again'}`);
        } finally {
            hideLoader();
        }
    }
 /** end wordle API integrations */
