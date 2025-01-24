document.addEventListener("DOMContentLoaded", () => {
  const valueInput = document.getElementById("value");
  let initialValue = getURLValue() || getInputValue();

  setInputValue(initialValue);
  updateOutput(initialValue);
  // Prevent typing the minus sign
  valueInput.addEventListener("keydown", (event) => {
    if (event.key === "-") {
      event.preventDefault();
    }
  });

  valueInput.addEventListener("input", (event) => {
    const value = parseInt(valueInput.value);

    if (valueInput.value === "") {
      return;
    }

    if (isNaN(value) || value < 0) {
      valueInput.value = "0";
    }

    updateOutput(value);
  });

  valueInput.addEventListener("change", (event) => {
    const value = getInputValue();
    if (isNaN(value) || value < 0) {
      valueInput.value = "0";
    }

    updateOutput(value);
  });
});

function getInputValue() {
  const valueInput = document.getElementById("value");
  return parseInt(valueInput.value);
}

function setInputValue(value) {
  const valueInput = document.getElementById("value");
  valueInput.value = value;
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
  v0 = Math.max(value - span, 0);
  v1 = Math.min(value + span, 0xffffffff);
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
