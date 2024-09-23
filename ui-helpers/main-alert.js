const alertElement = document.querySelector('.alert');

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