// All text input fields.
let VALUE_INPUTS = [];
// All range sliders.
let VALUE_SLIDERS = [];

// Word list.
// prettier-ignore
const WORD_LIST = ["which","there","their","about","would","these","other","words","could","write","first","water","after","where","right","think","three","years","place","sound","great","again","still","every","small","found","those","never","under","might","while","house","world","below","asked","going","large","until","along","shall","being","often","earth","began","since","study","night","light","above","paper","parts","young","story","point","times","heard","whole","white","given","means","music","miles","thing","today","later","using","money","lines","order","group","among","learn","known","space","table","early","trees","short","hands","state","black","shown","stood","front","voice","kinds","makes","comes","close","power","lived","vowel","taken","built","heart","ready","quite","class","bring","round","horse","shows","piece","green","stand","birds","start","river","tried","least","field","whose","girls","leave","added","color","third","hours","moved","plant","doing","names","forms","heavy","ideas","cried","check","floor","begin","woman","alone","plane","spell","watch","carry","wrote","clear","named","books","child","glass","human","takes","party","build","seems","blood","sides","seven","mouth","solve","north","value","death","maybe","happy","tells","gives","looks","shape","lives","steps","areas","sense","speak","force","ocean","speed","women","metal","south","grass","scale","cells","lower","sleep","wrong","pages","ships","needs","rocks","eight","major","level","total","ahead","reach","stars","store","sight","terms","catch","works","board","cover","songs","equal","stone","waves","guess","dance","spoke","break","cause","radio","weeks","lands","basic","liked","trade","fresh","final","fight","meant","drive","spent","local","waxes","knows","train","bread","homes","teeth","coast","thick","brown","clean","quiet","sugar","facts","steel","forth","rules","notes","units","peace","month","verbs","seeds","helps","sharp","visit","woods","chief","walls","cross","wings","grown","cases","foods","crops","fruit","stick","wants","stage","sheep"]

document.addEventListener("DOMContentLoaded", () => {
  let initialValue = getURLValue() || 431136;

  setInputValue(initialValue);

  // Gather all value inputs and sliders.
  VALUE_INPUTS = document.getElementsByClassName("value-input");
  VALUE_SLIDERS = document.getElementsByClassName("value-slider");
  // Set up event listeners for all the numeric inputs.
  for (let input of VALUE_INPUTS) {
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
  for (let slider of VALUE_SLIDERS) {
    slider.addEventListener("input", (event) => {
      let value = parseInt(event.target.value);
      setInputValue(value);
    });
  }
});

function setInputValue(value) {
  // Set all the page numeric inputs to the given value.
  for (let input of VALUE_INPUTS) {
    input.value = value;
  }

  // Set all the page range sliders to the given value.
  for (let slider of VALUE_SLIDERS) {
    slider.value = value;
  }

  // Set all the elements of class value-as-number to the given value.
  const valueElements = document.getElementsByClassName("value-as-number");
  for (let elem of valueElements) {
    elem.textContent = value;
  }

  // Set all the elements of class value-as-words to the given value.
  const wordsElements = document.getElementsByClassName("value-as-words");
  const valueWords = asWords(value);
  for (let elem of wordsElements) {
    elem.textContent = valueWords;
  }

  /// Set all the elements of class value-as-hex to the given value.
  const hexElements = document.getElementsByClassName("value-as-hex");
  for (let elem of hexElements) {
    elem.textContent = asHex(value);
  }

  updateUnencodedNames(value, 4);
  updateOutput(value, 2);
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

function updateUnencodedNames(value, span = 2) {
  const elem = document.getElementById("unencoded-names");
  const v0 = Math.max(value - span, 0);
  const v1 = Math.min(value + span, 0xffffffff);
  elem.textContent = null;
  for (let i = v0; i <= v1; i++) {
    const item = document.createElement("li");
    if (i === value) {
      item.classList.add("highlight");
    }
    item.textContent = `${asHex(i)} ⇒ ${asWords(i)}`;
    elem.appendChild(item);
  }
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
    item.innerHTML = `<code>${asHex(i)} ⇒ ${asHex(e)}</code>`;
    outputs.appendChild(item);
  }
}

// Takes a 16-bit value and converts it into words
function asWords(value) {
  // Split the value into four values in [0..255]
  const w0 = WORD_LIST[(value >> (0 * 8)) & 0xff];
  const w1 = WORD_LIST[(value >> (1 * 8)) & 0xff];
  const w2 = WORD_LIST[(value >> (2 * 8)) & 0xff];
  const w3 = WORD_LIST[(value >> (3 * 8)) & 0xff];
  // Join the words with hyphens
  return `${w3}-${w2}-${w1}-${w0}`;
}

// Takes a 16-bit value and converts it into words
function asHex(value) {
  return value.toString(16).padStart(8, "0");
}
