let judgeMap = new Map();
let judgeItems = new Map();
let selectedJudges = [];
let dishItems = { appetizer: [], main: [], dessert: [] };
let bestDishes = { appetizer: [], main: [], dessert: [] };
let bestDishCount = 5;
let judgeDishCount = 5;

init();

// after the page is fully loaded, populate the judge list
document.addEventListener("DOMContentLoaded", onContentLoaded);

function init() {
  for (const judge of judge_data) {
    judgeMap.set(judge.judge, {
      appetizer: calculateCourseScores(judge, "appetizer"),
      main: calculateCourseScores(judge, "main"),
      dessert: calculateCourseScores(judge, "dessert"),
      cusine: judge.preference,
    });
  }
}

function onContentLoaded() {
  updateScorecards();
  populateJudgeList();

  // listen for changes to the judge_search input
  let search = document.getElementById("judge_search");
  search.addEventListener("input", handleJudgeSearch);
}

function handleJudgeSearch(event) {
  let search = event.target.value.toLowerCase();
  for (const [key, value] of judgeItems) {
    if (key.toLowerCase().includes(search)) {
      value.parentElement.style.display = "block";
    } else {
      value.parentElement.style.display = "none";
    }
  }
}

function populateJudgeList() {
  let judge_list = document.getElementById("judge_list");

  // create a list item containing a checkbox for each judge
  for (const judge of judge_data) {
    let li = document.createElement("li");
    let checkbox = document.createElement("input");
    checkbox.classList.add("judge_checkbox");
    checkbox.type = "checkbox";
    checkbox.id = judge.judge;
    checkbox.value = judge.judge;
    checkbox.addEventListener("change", handleJudgeSelection);
    let label = document.createElement("label");
    label.htmlFor = judge.judge;
    label.textContent = judge.judge;
    li.appendChild(checkbox);
    li.appendChild(label);
    judge_list.appendChild(li);
    judgeItems.set(judge.judge, checkbox);
  }
}

function updateScorecards() {
  // clear the lists that contain the list items
  dishItems = { appetizer: [], main: [], dessert: [] };

  for (let i = 0; i < 4; i++) {
    let scorecard = document.getElementById(`judge${i + 1}_scorecard`);
    i < selectedJudges.length
      ? populateScorecard(scorecard, selectedJudges[i])
      : resetScorecard(scorecard);
  }

  calculateBestDishes();
}

function resetScorecard(element) {
  element.classList.add("blank");
  let h3 = element.querySelector("h3");
  h3.textContent = "No Judge";
}

function populateScorecard(element, judge) {
  element.classList.remove("blank");
  // get the first h3 in element and set the text to the judge's name
  scores = judgeMap.get(judge);
  let h3 = element.querySelector("h3");
  h3.textContent = judge;

  // show the judge's favoried cusine
  let cusine = element.querySelector("#cusine");
  cusine.textContent = cusine_data[scores.cusine].icon;

  // set the tooltip for the cusine, format the text to be title case
  cusine.title = cusine_data[scores.cusine].name;

  // get the three ordered lists in the element named appetizer_list, main_list, and dessert_list
  let appetizer_list = element.querySelector("#appetizer_list");
  let main_list = element.querySelector("#main_list");
  let dessert_list = element.querySelector("#dessert_list");

  // clear the ordered lists
  appetizer_list.innerHTML = "";
  main_list.innerHTML = "";
  dessert_list.innerHTML = "";

  // populate the ordered lists with the top five judge's scores
  for (let i = 0; i < judgeDishCount; i++) {
    let appetizer_li = document.createElement("li");
    let main_li = document.createElement("li");
    let dessert_li = document.createElement("li");

    populateScorecardItem(appetizer_li, scores.appetizer[i], "appetizer");
    populateScorecardItem(main_li, scores.main[i], "main");
    populateScorecardItem(dessert_li, scores.dessert[i], "dessert");

    appetizer_list.appendChild(appetizer_li);
    main_list.appendChild(main_li);
    dessert_list.appendChild(dessert_li);

    dishItems.appetizer.push(appetizer_li);
    dishItems.main.push(main_li);
    dishItems.dessert.push(dessert_li);
  }
}

function populateScorecardItem(element, dish, course) {
  let name = document.createElement("span");
  let rating = document.createElement("span");
  rating.classList.add("rating");
  name.textContent = dish.favorite ? `❤️ ${dish.dish}` : dish.dish;
  rating.textContent = dish.score;
  element.appendChild(name);
  element.appendChild(rating);
  element.classList.add("scorecard_item");
  element.setAttribute("data-dish", dish.dish);
  element.setAttribute("data-course", course);
  element.addEventListener("mouseenter", handleDishMouseEnter);
  element.addEventListener("mouseleave", handleDishMouseLeave);
}

function handleJudgeSelection(event) {
  // determine how many items are selected
  // judge_items contains all the checkboxes
  selectedJudges = [];
  for (const [key, value] of judgeItems) {
    if (value.checked) {
      selectedJudges.push(key);
    }
  }

  // if there are four selected judges, disable all other checkboxes
  if (selectedJudges.length === 4) {
    for (const [key, value] of judgeItems) {
      if (!value.checked) {
        value.disabled = true;
      }
    }
  } else {
    for (const [key, value] of judgeItems) {
      value.disabled = false;
    }
  }

  updateScorecards();
}

function handleDishMouseEnter(event) {
  let course = event.target.getAttribute("data-course");
  let dish = event.target.getAttribute("data-dish");
  highlightDish(course, dish);
}

function handleDishMouseLeave(event) {
  let course = event.target.getAttribute("data-course");
  highlightDish(course, "");
}

function highlightDish(course, dish) {
  let dishCount = dishItems[course]?.length ?? 0;

  for (let i = 0; i < dishCount; ++i) {
    let element = dishItems[course][i];
    if (element.getAttribute("data-dish") === dish) {
      element.classList.add("highlight");
    } else {
      element.classList.remove("highlight");
    }
  }
}

function calculateCourseScores(judge, course) {
  let scores = [];
  for (const dish of dish_data) {
    scores.push(calculateDishScore(judge, dish, course));
  }

  // sort the scores from highest to lowest, favoring the judge's favorite dish
  scores.sort((a, b) => {
    if (b.score - a.score === 0) {
      if (a.favorite) {
        return -1;
      } else if (b.favorite) {
        return 1;
      }
      return b.name < a.name;
    }
    return b.score - a.score;
  });

  return scores;
}

function calculateDishScore(judge, dish, course) {
  // get the base score based on the judge's preference
  let base_score = dish.rating[judge.preference];

  let is_favorite = dish.dish === judge.favorite;
  // if the dish is the judge's favorite, the score is 5
  if (is_favorite) {
    base_score = 5;
  }

  // if the dish is the wrong course, halve the score
  if (dish.course !== course) {
    base_score *= 0.5;
  }

  // Floor the score to the lowest integer
  base_score = Math.floor(base_score);

  return {
    dish: dish.dish,
    score: base_score,
    favorite: is_favorite,
  };
}

function calculateBestDishes() {
  // Clear the lists that contain the best dishes
  bestDishes = { appetizer: [], main: [], dessert: [] };
  appetizerMap = new Map();
  mainMap = new Map();
  dessertMap = new Map();
  // Calculate the maximum score for each dish/course paring
  for (dish of dish_data) {
    let dishName = dish.dish;
    appetizerMap.set(dishName, { dish: dishName, score: 0, favorite: false });
    mainMap.set(dishName, { dish: dishName, score: 0, favorite: false });
    dessertMap.set(dishName, { dish: dishName, score: 0, favorite: false });
  }

  for (judgeName of selectedJudges) {
    let judge = judgeMap.get(judgeName);
    for (dish of judge.appetizer) {
      appetizerMap.get(dish.dish).score += dish.score;
    }
    for (dish of judge.main) {
      mainMap.get(dish.dish).score += dish.score;
    }
    for (dish of judge.dessert) {
      dessertMap.get(dish.dish).score += dish.score;
    }
  }

  // Sort the dishes by score
  let appetizerSorted = Array.from(appetizerMap).sort(
    (a, b) => b[1].score - a[1].score
  );
  let mainSorted = Array.from(mainMap).sort((a, b) => b[1].score - a[1].score);
  let dessertSorted = Array.from(dessertMap).sort(
    (a, b) => b[1].score - a[1].score
  );

  // Get the top 3 dishes for each course
  for (let i = 0; i < bestDishCount; i++) {
    bestDishes.appetizer.push(appetizerSorted[i]);
    bestDishes.main.push(mainSorted[i]);
    bestDishes.dessert.push(dessertSorted[i]);
  }

  populateBestDishes();
}

function populateBestDishes() {
  console.log(bestDishes);
  let bestDishesElement = document.querySelector("#best_dishes");
  let appetizerList = bestDishesElement.querySelector("#appetizer_list");
  let mainList = bestDishesElement.querySelector("#main_list");
  let dessertList = bestDishesElement.querySelector("#dessert_list");

  appetizerList.innerHTML = "";
  mainList.innerHTML = "";
  dessertList.innerHTML = "";

  for (let i = 0; i < bestDishCount; i++) {
    let appetizerLi = document.createElement("li");
    let mainLi = document.createElement("li");
    let dessertLi = document.createElement("li");

    populateScorecardItem(appetizerLi, bestDishes.appetizer[i][1], "appetizer");
    populateScorecardItem(mainLi, bestDishes.main[i][1], "main");
    populateScorecardItem(dessertLi, bestDishes.dessert[i][1], "dessert");

    appetizerList.appendChild(appetizerLi);
    mainList.appendChild(mainLi);
    dessertList.appendChild(dessertLi);
  }
}
