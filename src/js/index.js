import Search from './models/Search'
import * as searchView from './views/searchView'
import * as recipeView from './views/recipeView'
import * as listView from './views/listView'
import * as likesView from './views/likesView'
import { elements, renderLoader, clearLoader } from './views/base'
import Recipe from './models/Recipe'
import List from './models/List'
import Likes from './models/Likes'

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

    // 2.5 highlight selected recipe
    if (state.search) {
      searchView.highlightSelected(id);
    }

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
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
      );

    } catch (err) {
      alert("Error processing recipe!")
    }
  }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

//restore liked recipe on page load
window.addEventListener('load', () => {
  state.likes = new Likes();
  state.likes.readStorage();
  likesView.toggleLikesMenu(state.likes.getNumLikes());
  state.likes.likes.forEach(item => {
    likesView.renderLike(item);
  });

})

//handling dec and inc of servings
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    controlLike();
  }
});

// List controller

const controlList = () => {
  // 1. create a new list if there is not one
  if (!state.list) state.list = new List();

  // 2. add each ingredient to the list and the render on UI
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  })
}

elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  // 1. Handle delete event
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    console.log('deleting')
    // 1.1 delete from state
    state.list.deleteItem(id);
    // 1.2 delete from UI
    listView.deleteItem(id);

  // 2. Handle count update
} else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});


// Like controller

const controlLike = () => {
  // 1. create a new list if there is not one
  if (!state.likes) state.likes = new Likes();

  const currentId = state.recipe.id;

  // 2. user not liked current recipe
  if (!state.likes.isLiked(currentId)) {

    // 2.1 add like to list
    const newLike = state.likes.addLike(
      currentId,
      state.recipe.title,
      state.recipe.publisher,
      state.recipe.image
    );

    // 2.2 toggle the like button
    likesView.toggleLikeButton(true);

    // 2.3 add like button to UI
    likesView.renderLike(newLike);

  // 3. user has not liked current page
  } else {
      // 3.1 remove like to list
      state.likes.deleteLike(currentId);

      // 3.2 toggle the like button
      likesView.toggleLikeButton(false);

      // 3.3 remove like button to UI
      likesView.deleteLike(currentId);

  }
  likesView.toggleLikesMenu(state.likes.getNumLikes());
}
