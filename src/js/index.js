import Search from './models/Search'
import * as searchView from './views/searchView'
import * as recipeView from './views/recipeView'
import { elements, renderLoader, clearLoader } from './views/base'
import Recipe from './models/Recipe'

// Global state of the app
// - Search object
// - Current recipe object
// - Shopping list object
// - Liked recipes


const state = {};


// Search Controller
const controlSearch = async () => {
  // 1. Get query from view
  const query = searchView.getInput();

  if (query) {
    // 2. New search object for query
    state.search = new Search(query);

    // 3. Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try {
      // 4. Search for recipes
      await state.search.getResults();

      // 5. Render results on UI
      clearLoader();
      searchView.renderResults(state.search.results);
    } catch (error) {
      alert("Error, something went wrong with the Search!");
      clearLoader();
    }
  }
}

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');
  console.log(btn);
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.results, goToPage);
  }
})

// Recipe Controller

const controlRecipe = async () => {
  // 1. Get id from url
  const id = window.location.hash.replace('#', '');
  if (id) {
    // 2. Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // 3. Create new Recipe object
    state.recipe = new Recipe(id);

    // // Testing
    // window.r = state.recipe;

    try {
      // 4. Get recipe data
      await state.recipe.getRecipe();
      state.recipe.parseIngredient();

      // 5. Calculate Servings and Time
      state.recipe.calcTime();
      state.recipe.calcServings();

      // 6. Render Recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe);

    } catch (err) {
      alert("Error processing recipe!")
    }
  }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));
