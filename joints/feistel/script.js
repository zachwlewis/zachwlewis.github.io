// All text input fields.
const VALUE_INPUTS = ["value"];
// All range sliders.
const VALUE_SLIDERS = ["value_range"];

// Word list.
// prettier-ignore
const WORD_LIST = ["dude","gang","frit","whine","quiche","thresh","grudge","baste","cringe","pour","wrap","twine","mice","silt","leech","slug","swing","swill","stun","yolk","blond","jest","sledge","teal","fjord","bloke","pleat","sneer","cult","skit","trawl","weave","mall","scrim","foe","torch","tart","breeze","stich","foul","smudge","trout","tong","coil","sing","trill","weigh","glume","gauge","freeze","craw","spurn","paint","swear","griffe","duck","smell","chap","duct","pear","bin","brag","maim","plot","haste","cloak","hawk","gulp","rent","scrap","kerf","reach","serf","tine","arch","tour","sprout","glide","probe","sham","squat","trump","mix","strum","fund","prude","strait","sponge","drape","whiff","gag","fizz","clique","spool","snort","chair","curb","prop","limp","bong","sconce","morgue","barre","darn","gig","realm","cur","brood","threat","guard","sore","switch","lobe","rant","pose","shed","cop","twill","czar","gut","chub","sight","nudge","squeal","flinch","cling","year","clone","stake","fuze","moat","chuff","flush","scour","awl","boar","peek","starch","crook","molt","clutch","joke","prey","tomb","rinse","stilt","strife","flirt","thrust","melt","fade","ape","gap","snack","yurt","frown","plod","noun","gore","mast","tally","snag","poop","pile","rule","broil","lush","swell","gnash","jinn","hash","dread","elf","might","rage","path","lice","binge","hate","cord","intro","horde","smock","rash","whoosh","blight","tribe","crunch","grunt","fret","junk","trim","there","bawl","course","burn","gnaw","flank","cheer","kin","fat","singe","kneel","prompt","frill","mope","rest","guile","wharf","putt","bribe","fluke","trope","breed","foal","skink","sprat","nape","crew","squad","claim","shoot","shake","zoom","gloom","scold","shrug","blot","strafe","flu","dug","wane","bisque","hoax","gnat","bro","chimp","throne","lisp","geese","shove","quote","vaunt","peon","meteor","punk","hoot","groove","haze","nurse","fleece","garb","fugue","fetch","kale","tray"]

document.addEventListener("DOMContentLoaded", () => {
  let initialValue = getURLValue() || 69420;

  setInputValue(initialValue);

  // Set up event listeners for all the numeric inputs.
  for (let id of VALUE_INPUTS) {
    const input = document.getElementById(id);
    // Prevent typing the minus sign
    input.addEventListener("keydown", (event) => {
      if (event.key === "-") {
        event.preventDefault();
      }
    });

    input.addEventListener("input", (event) => {
      let value = parseInt(event.target.value);

      if (value === "") {
        return;
      }

      if (isNaN(value) || value < 0) {
        value = 0;
      }

      setInputValue(value);
    });

    input.addEventListener("change", (event) => {
      let value = parseInt(event.target.value);
      if (isNaN(value) || value < 0) {
        value = 0;
      }

      setInputValue(value);
    });
  }

  // Set up event listeners for all the range sliders.
  for (let id of VALUE_SLIDERS) {
    const slider = document.getElementById(id);
    slider.addEventListener("input", (event) => {
      let value = parseInt(event.target.value);
      setInputValue(value);
    });
  }
});

function setInputValue(value) {
  // Set all the page numeric inputs to the given value.
  for (let id of VALUE_INPUTS) {
    const input = document.getElementById(id);
    input.value = value;
  }

  // Set all the page range sliders to the given value.
  for (let id of VALUE_SLIDERS) {
    const slider = document.getElementById(id);
    slider.value = value;
  }

  // Set all the elements of class value-as-number to the given value.
  const valueElements = document.getElementsByClassName("value-as-number");
  for (let elem of valueElements) {
    elem.textContent = value;
  }

  // Set all the elements of class value-as-words to the given value.
  const wordsElements = document.getElementsByClassName("value-as-words");
  const valueWords = valueToWords(value);
  for (let elem of wordsElements) {
    elem.textContent = valueWords;
  }

  updateOutput(value);
}

function getURLValue() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  urlValue = parseInt(urlParams.get("value"));
  if (isNaN(urlValue) || urlValue < 0) {
    return null;
  }

  return urlValue;
}

function updateOutput(value, span = 2) {
  const v0 = Math.max(value - span, 0);
  const v1 = Math.min(value + span, 0xffffffff);
  const outputs = document.getElementById("outputs");
  outputs.textContent = null;
  for (let i = v0; i <= v1; i++) {
    const item = document.createElement("li");
    if (i === value) {
      item.classList.add("highlight");
    }
    let e = encode(i);
    const from = i.toString(16).padStart(8, "0");
    const to = e.toString(16).padStart(8, "0");
    item.innerHTML = `<code>${from} &#x21D2; ${to}</code>`;
    outputs.appendChild(item);
  }
}

// Takes a 16-bit value and converts it into words
function valueToWords(value) {
  // Split the value into four values in [0..255]
  const w0 = WORD_LIST[(value >> (0 * 8)) & 0xff];
  const w1 = WORD_LIST[(value >> (1 * 8)) & 0xff];
  const w2 = WORD_LIST[(value >> (2 * 8)) & 0xff];
  const w3 = WORD_LIST[(value >> (3 * 8)) & 0xff];
  // Join the words with hyphens
  return `${w0}-${w1}-${w2}-${w3}`;
}
