document.addEventListener("DOMContentLoaded", () => {
  const valueInput = document.getElementById("value");
  updateOutput(0);
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
});

function updateOutput(value, span = 4) {
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
    item.innerHTML = `<span class="value">${i
      .toString(16)
      .padStart(8, "0")}</span> &#x21D2; <span class="value">${e
      .toString(16)
      .padStart(8, "0")}</span>`;
    outputs.appendChild(item);
  }
}
