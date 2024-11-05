const crafted_masks = [
  { id: "seeker-m", crafted: false },
  { id: "magicseeker-m", crafted: false },
  { id: "soulhacker-m", crafted: false },
  { id: "mage-m", crafted: false },
  { id: "wizard-m", crafted: false },
  { id: "elementalist-m", crafted: false },
  { id: "warlock-m", crafted: false },
  { id: "warrior-m", crafted: false },
  { id: "swordmaster-m", crafted: false },
  { id: "samurai-m", crafted: false },
  { id: "knight-m", crafted: false },
  { id: "mageknight-m", crafted: false },
  { id: "paladin-m", crafted: false },
  { id: "darkknight-m", crafted: false },
  { id: "brawler-m", crafted: false },
  { id: "pugilist-m", crafted: false },
  { id: "martialartist-m", crafted: false },
  { id: "healer-m", crafted: false },
  { id: "cleric-m", crafted: false },
  { id: "saviour-m", crafted: false },
  { id: "gunner-m", crafted: false },
  { id: "sniper-m", crafted: false },
  { id: "dragoon-m", crafted: false },
  { id: "thief-m", crafted: false },
  { id: "assassin-m", crafted: false },
  { id: "ninja-m", crafted: false },
  { id: "faker-m", crafted: false },
  { id: "trickster-m", crafted: false },
  { id: "commander-m", crafted: false },
  { id: "general-m", crafted: false },
  { id: "warlord-m", crafted: false },
  { id: "merchant-m", crafted: false },
  { id: "tycoon-m", crafted: false },
  { id: "summoner-m", crafted: false },
  { id: "devilsummoner-m", crafted: false },
  { id: "berserker-m", crafted: false },
  { id: "destroyer-m", crafted: false },
  { id: "dancer-m", crafted: false },
  { id: "mend-m", crafted: false },
  { id: "mind-m", crafted: false },
  { id: "muscle-m", crafted: false },
  { id: "mercy-m", crafted: false },
];

const mask_requirements = [];

// START: local storage functions

function saveCraftedMasksToLocalStorage() {
  localStorage.setItem("crafted_masks", JSON.stringify(crafted_masks));
}

function loadCraftedMasksFromLocalStorage() {
  const storedMasks = localStorage.getItem("crafted_masks");
  if (storedMasks) {
    const parsedMasks = JSON.parse(storedMasks);
    parsedMasks.forEach((storedMask) => {
      const mask = crafted_masks.find((m) => m.id === storedMask.id);
      if (mask) {
        mask.crafted = storedMask.crafted;
      }
    });
  }
}

function saveShowComputedIngredientsToLocalStorage(showComputed) {
  localStorage.setItem(
    "show_computed_ingredients",
    JSON.stringify(showComputed)
  );
}

function loadShowComputedIngredientsFromLocalStorage() {
  const storedValue = localStorage.getItem("show_computed_ingredients");
  return storedValue ? JSON.parse(storedValue) : false;
}

// END: local storage functions

/**
 * Computes all the required white masks to create a mask.
 * If the mask requires another mask, it will compute the ingredients for that mask as well.
 * @param {*} maskId
 * @returns {Array<{id,quantity}>} An array of white mask ids required to craft the mask.
 */
function computeWhiteMaskIngredientsForMask(maskId) {
  const whiteMaskIngredients = [];
  const mask = item_list[maskId];

  mask.ingredients.forEach((ingredientId) => {
    if (item_list[ingredientId].type === "mask") {
      // This item is a mask.
      // Compute its ingredients.
      const subIngredients = computeWhiteMaskIngredientsForMask(ingredientId);
      subIngredients.forEach((subIngredient) => {
        const existingIngredient = whiteMaskIngredients.find(
          (i) => i.id === subIngredient.id
        );
        if (existingIngredient) {
          existingIngredient.quantity += subIngredient.quantity;
        } else {
          whiteMaskIngredients.push(subIngredient);
        }
      });
    } else {
      // This is a white mask.
      const existingIngredient = whiteMaskIngredients.find(
        (i) => i.id === ingredientId
      );
      if (existingIngredient) {
        existingIngredient.quantity += 1;
      } else {
        whiteMaskIngredients.push({ id: ingredientId, quantity: 1 });
      }
    }
  });

  console.log(
    "Computed white mask ingredients for",
    maskId,
    whiteMaskIngredients
  );
  return whiteMaskIngredients;
}

function addIngredients(ingredientId, requiredItems, showComputed) {
  const ingredient = item_list[ingredientId];
  if (requiredItems[ingredientId]) {
    requiredItems[ingredientId].quantity += 1;
  } else {
    requiredItems[ingredientId] = {
      id: ingredientId,
      quantity: 1,
      title: ingredient.title,
      type: ingredient.type,
    };
  }

  if (showComputed && ingredient.type === "mask") {
    ingredient.ingredients.forEach((subIngredientId) => {
      addIngredients(subIngredientId, requiredItems, showComputed);
    });
  }
}

function sortItemsByOrder(items) {
  return items.sort(
    (a, b) => sort_order.indexOf(a.id) - sort_order.indexOf(b.id)
  );
}

function updateShoppingList() {
  const maskRequirementsUl = document.getElementById("maskRequirements");
  const whiteMaskRequirementsUl = document.getElementById(
    "whiteMaskRequirements"
  );
  const showComputed = document.getElementById(
    "show-computed-ingredients"
  ).checked;

  maskRequirementsUl.innerHTML = "";
  whiteMaskRequirementsUl.innerHTML = "";
  const requiredItems = {};

  crafted_masks.forEach((mask) => {
    if (!mask.crafted) {
      item_list[mask.id].ingredients.forEach((ingredientId) => {
        let shouldCompute =
          showComputed && item_list[ingredientId].type === "mask";
        addIngredients(ingredientId, requiredItems, shouldCompute);
      });
    }
  });

  const masks = [];
  const whiteMasks = [];

  Object.values(requiredItems).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.quantity}× ${item.title}`;
    if (item.type === "mask") {
      masks.push({ id: item.id, element: li });
    } else {
      whiteMasks.push({ id: item.id, element: li });
    }
  });

  sortItemsByOrder(masks).forEach((item) =>
    maskRequirementsUl.appendChild(item.element)
  );
  if (showComputed) {
    sortItemsByOrder(whiteMasks).forEach((item) =>
      whiteMaskRequirementsUl.appendChild(item.element)
    );
    maskRequirementsUl.classList.add("faded");
  } else {
    sortItemsByOrder(whiteMasks).forEach((item) =>
      whiteMaskRequirementsUl.appendChild(item.element)
    );
    maskRequirementsUl.classList.remove("faded");
  }
}

function createMaskListItem(mask) {
  const li = document.createElement("li");
  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  const span = document.createElement("span");

  checkbox.type = "checkbox";
  checkbox.checked = mask.crafted;
  checkbox.addEventListener("change", function () {
    mask.crafted = checkbox.checked;
    saveCraftedMasksToLocalStorage();
    updateShoppingList();
  });

  span.textContent = item_list[mask.id].title;
  label.appendChild(checkbox);
  label.appendChild(span);
  li.appendChild(label);
  return li;
}

function initializeMaskList() {
  loadCraftedMasksFromLocalStorage();
  const ul = document.getElementById("masks");
  crafted_masks.forEach((mask) => {
    const li = createMaskListItem(mask);
    ul.appendChild(li);
  });
  updateShoppingList();
}

document.addEventListener("DOMContentLoaded", function () {
  const showComputedCheckbox = document.getElementById(
    "show-computed-ingredients"
  );
  showComputedCheckbox.checked = loadShowComputedIngredientsFromLocalStorage();
  showComputedCheckbox.addEventListener("change", function () {
    saveShowComputedIngredientsToLocalStorage(showComputedCheckbox.checked);
    updateShoppingList();
  });

  initializeMaskList();
});

function sortItemsByOrder(items) {
  return items.sort(
    (a, b) => sort_order.indexOf(a.id) - sort_order.indexOf(b.id)
  );
}

function updateShoppingList() {
  const maskRequirementsUl = document.getElementById("maskRequirements");
  const whiteMaskRequirementsUl = document.getElementById(
    "whiteMaskRequirements"
  );
  const showComputed = document.getElementById(
    "show-computed-ingredients"
  ).checked;

  maskRequirementsUl.innerHTML = "";
  whiteMaskRequirementsUl.innerHTML = "";
  const requiredItems = {};

  crafted_masks.forEach((mask) => {
    if (!mask.crafted) {
      item_list[mask.id].ingredients.forEach((ingredientId) => {
        let shouldCompute =
          showComputed && item_list[ingredientId].type === "mask";
        addIngredients(ingredientId, requiredItems, shouldCompute);
      });
    }
  });

  const masks = [];
  const whiteMasks = [];

  Object.values(requiredItems).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.quantity}× ${item.title}`;
    if (item.type === "mask") {
      masks.push({ id: item.id, element: li });
    } else {
      whiteMasks.push({ id: item.id, element: li });
    }
  });

  sortItemsByOrder(masks).forEach((item) =>
    maskRequirementsUl.appendChild(item.element)
  );
  if (showComputed) {
    sortItemsByOrder(whiteMasks).forEach((item) =>
      whiteMaskRequirementsUl.appendChild(item.element)
    );
    maskRequirementsUl.classList.add("faded");
  } else {
    sortItemsByOrder(whiteMasks).forEach((item) =>
      whiteMaskRequirementsUl.appendChild(item.element)
    );
    maskRequirementsUl.classList.remove("faded");
  }
}

function createMaskListItem(mask) {
  const li = document.createElement("li");
  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  const span = document.createElement("span");

  checkbox.type = "checkbox";
  checkbox.checked = mask.crafted;
  checkbox.addEventListener("change", function () {
    mask.crafted = checkbox.checked;
    saveCraftedMasksToLocalStorage();
    updateShoppingList();
  });

  span.textContent = item_list[mask.id].title;
  label.appendChild(checkbox);
  label.appendChild(span);
  li.appendChild(label);
  return li;
}

function initializeMaskList() {
  loadCraftedMasksFromLocalStorage();
  const ul = document.getElementById("masks");
  crafted_masks.forEach((mask) => {
    const li = createMaskListItem(mask);
    ul.appendChild(li);
  });
  updateShoppingList();
}

document.addEventListener("DOMContentLoaded", function () {
  const showComputedCheckbox = document.getElementById(
    "show-computed-ingredients"
  );
  showComputedCheckbox.checked = loadShowComputedIngredientsFromLocalStorage();
  showComputedCheckbox.addEventListener("change", function () {
    saveShowComputedIngredientsToLocalStorage(showComputedCheckbox.checked);
    updateShoppingList();
  });
  const toggleInstructionButton = document.getElementById("collapse-button");
  toggleInstructionButton.addEventListener("click", function () {
    const instructions = document.getElementById("instructions");
    instructions.classList.toggle("hidden");
  });

  initializeMaskList();
});
