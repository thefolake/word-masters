const alertElement = document.querySelector('.alert');
const loaderElement = document.querySelector('.loader-container');

const isLetter = (letter) => {
  return /^[a-zA-Z]$/.test(letter);
}

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

/**  ====== start loader controls ========= */

const loadingState = {
  isLoading: true
};

const setLoading = (newLoadingState) => {
  loadingState.isLoading = newLoadingState;
  loaderElement.classList.toggle('show', loadingState.isLoading);
}

const showLoader = () => {
  setLoading(true);
}

const hideLoader = () => {
  setLoading(false);
}
/**  ====== end loader controls ========= */