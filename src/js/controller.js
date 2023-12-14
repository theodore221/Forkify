import icons from '../img/icons.svg';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView';
import paginationView from './views/paginationView';
import bookmarksView from './views/bookmarksView';
import addRecipeView from './views/addRecipeView';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlShowRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);
    console.log(id);

    if (!id) return;
    recipeView.renderSpinner();

    resultsView.update(model.getSearchResultsPage());

    await model.loadRecipe(id);
    //2. Rendering the Recipe
    recipeView.render(model.state.recipe);
    bookmarksView.update(model.state.bookmarks);

    //console.log(res, data);
  } catch (err) {
    alert(err);
    recipeView.renderError(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    const query = searchView.getQuery();
    searchView.clearInput();
    if (!query) return;

    await model.loadSearchResults(query);
    console.log(model.state.search.results.length === 0);
    if (model.state.search.results.length === 0) {
      console.log('gets here');
      resultsView.renderError(
        'No recipes found for your query. Please try again!'
      );
    }

    resultsView.render(model.getSearchResultsPage());
    paginationView.render(model.state.search);
  } catch (err) {
    resultsView.renderError(err);
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
};

const controlServings = function (newServ) {
  model.changeServings(newServ);
  recipeView.update(model.state.recipe);
};

const controlBookmarks = function () {
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.removeBookmark(model.state.recipe.id);
  }
  recipeView.update(model.state.recipe);
  console.table(model.state.bookmarks);

  bookmarksView.render(model.state.bookmarks);
};

const controlRenderBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  console.log(newRecipe);
  await model.uploadRecipe(newRecipe);

  console.log(model.state.recipe);
  recipeView.render(model.state.recipe);
};

const init = function () {
  recipeView.addHandlerRender(controlShowRecipe);
  bookmarksView.addHandlerRender(controlRenderBookmarks);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerPagination(controlPagination);
  recipeView.addHandlerServings(controlServings);
  recipeView.addHandlerAddBookmark(controlBookmarks);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
