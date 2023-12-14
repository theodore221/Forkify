import { API_URL } from './config.js';
import { getJSON, sendJSON } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: 10,
    page: 1,
  },
  bookmarks: [],
};

function createRecipeObject(recipe) {
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
}

export const loadRecipe = async function (id) {
  try {
    const url =
      API_URL + '/' + id + '?key=a5554023-1180-4103-b9a4-0f3681af1442';
    data = await getJSON(url);

    const { recipe } = data.data;
    state.recipe = createRecipeObject(recipe);

    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }

    console.log(state.recipe);
  } catch (err) {
    alert(err);
  }
};

export const loadSearchResults = async function (keyword) {
  const url =
    API_URL +
    `?search=${keyword}` +
    `&key=a5554023-1180-4103-b9a4-0f3681af1442`;

  data = await getJSON(url);
  console.log(data);

  state.search.query = keyword;
  state.search.results = data.data.recipes.map(rec => {
    return {
      id: rec.id,
      image: rec.image_url,
      publisher: rec.publisher,
      title: rec.title,
    };
  });
  state.search.page = 1;
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

export const changeServings = function (newServ) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServ) / state.recipe.servings;
  });
  state.recipe.servings = newServ;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);

  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

export const removeBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  if (id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

export const uploadRecipe = async function (newRecipe) {
  const ingredients = Object.entries(newRecipe)
    .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
    .map(entry => {
      const ingArry = entry[1].replaceAll(' ', '').split(',');
      const [quantity, unit, description] = ingArry;
      return { quantity, unit, description };
    });

  const recipeData = {
    title: newRecipe.title,
    source_url: newRecipe.sourceUrl,
    image_url: newRecipe.image,
    publisher: newRecipe.publisher,
    cooking_time: +newRecipe.cookingTime,
    servings: +newRecipe.servings,
    ingredients,
  };

  const url = API_URL + `?key=a5554023-1180-4103-b9a4-0f3681af1442`;

  data = await sendJSON(url, recipeData);
  const { recipe } = data.data;
  console.log(recipe);
  state.recipe = createRecipeObject(recipe);
  console.log(state.recipe);
  console.log('PRINTED HERE');
  addBookmark(state.recipe);
};
