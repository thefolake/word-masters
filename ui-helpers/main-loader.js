const loaderElement = document.querySelector('.loader-container');

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

const isLoading = () => loadingState.isLoading;

/**  ====== end loader controls ========= */