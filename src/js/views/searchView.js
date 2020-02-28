import { elements } from './base'

export const getInput = () => elements.searchInput.value;

export const clearInput = () => elements.searchInput.value = '';

export const clearResults = () => {
  elements.searchResList.innerHTML = '';
  elements.searchResPages.innerHTML = '';
}

export const highlightSelected = id => {
  const resultsArray = Array.from(document.querySelectorAll('.results__link'));
  resultsArray.forEach((item, i) => {
    item.classList.remove('results__link--active');
  });

  document.querySelector(`a[href="#${id}"]`).classList.add('results__link--active');
}

const limitRecipeTitle = (title, limit = 17) => {
  const newTitle = [];
  if (title.length > limit) {
    title.split(' ').reduce((acc, current) => {
      if (acc + current.length < limit) {
        newTitle.push(current);
      }
      return acc + current.length;
    }, 0);
    return `${newTitle.join(' ')}...`
  }
  return title;
};

const renderRecipe = recipe => {
  const markup = `
    <li>
        <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src=${recipe.image_url} alt="Test">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                <p class="results__author">${recipe.publisher}</p>
            </div>
        </a>
    </li>
    `;
    elements.searchResList.insertAdjacentHTML('beforeend', markup);
};

//type: 'prev' or 'next'
const createButton = (page, type) => `
  <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
    <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
      <svg class="search__icon">
          <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
      </svg>
  </button>
  `;

const renderButtons = (page, numResults, resPerPage) => {
  const pages = Math.ceil(numResults / resPerPage);
  let button;
  if (page === 1 && pages > 1) {
    //button to next page
    button = createButton(page, 'next');
  } else if (page < pages) {
    //both buttons
    button = `${createButton(page, 'next')}
              ${createButton(page, 'prev')}
              `
  } else if (page === pages && pages > 1) {
    //only prev buttion
    button = createButton(page, 'prev');
  }
  elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recipes, page = 1, numPerPage = 10) => {
  // 1. Render results of current page
  const start = (page - 1) * numPerPage;
  const end = page*numPerPage;
  recipes.slice(start, end).forEach(renderRecipe);
  // 2. Render buttons
  renderButtons(page, recipes.length, numPerPage);
};
