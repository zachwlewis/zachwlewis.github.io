let judgeMap = new Map();
let judgeItems = new Map();
let selectedJudges = [];
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
    checkbox.addEventListener("change", handle_judge_selection);
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
  for (let i = 0; i < 4; i++) {
    let scorecard = document.getElementById(`judge${i + 1}_scorecard`);
    i < selectedJudges.length
      ? populateScorecard(scorecard, selectedJudges[i])
      : resetScorecard(scorecard);
  }
}
function resetScorecard(element) {
  console.log("resetting", element);
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
  for (let i = 0; i < 5; i++) {
    let appetizer_li = document.createElement("li");
    let main_li = document.createElement("li");
    let dessert_li = document.createElement("li");

    populateScorecardItem(
      appetizer_li,
      scores.appetizer[i].dish,
      scores.appetizer[i].score
    );
    populateScorecardItem(main_li, scores.main[i].dish, scores.main[i].score);
    populateScorecardItem(
      dessert_li,
      scores.dessert[i].dish,
      scores.dessert[i].score
    );

    appetizer_list.appendChild(appetizer_li);
    main_list.appendChild(main_li);
    dessert_list.appendChild(dessert_li);
  }
}

function populateScorecardItem(element, dish, score) {
  let name = document.createElement("span");
  let rating = document.createElement("span");
  rating.classList.add("rating");
  name.textContent = dish;
  rating.textContent = score;
  element.appendChild(name);
  element.appendChild(rating);
}

function handle_judge_selection(event) {
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

function calculateCourseScores(judge, course) {
  let scores = [];
  for (const dish of dish_data) {
    scores.push(calculate_dish_score(judge, dish, course));
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

function calculate_dish_score(judge, dish, course) {
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

  let dish_name = is_favorite ? `❤️ ${dish.dish}` : dish.dish;

  return {
    dish: dish_name,
    score: base_score,
    favorite: is_favorite,
  };
}
