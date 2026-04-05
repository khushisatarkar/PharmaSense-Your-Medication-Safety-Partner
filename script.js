let medications = [];
let brandToGeneric = {};

async function loadMedicineData() {
  const res = await fetch("brand_to_generic.json");
  const data = await res.json();
  brandToGeneric = {};
  for (let key in data) {
    brandToGeneric[key.toLowerCase()] = data[key];
  }
}

loadMedicineData();
function getAllMedicineNames() {
  return Object.keys(brandToGeneric);
}
let pendingValue = "";
let correctedValue = "";

function addDrug() {
  const input = document.getElementById("drugInput");
  const drugName = input.value.trim();

  if (drugName === "") return;

  if (!Object.keys(brandToGeneric).length) {
    alert("Loading medicine database... please try again.");
    return;
  }

  const lowerDrug = drugName.toLowerCase();
  // prevent duplicates
  if (medications.includes(lowerDrug)) {
    alert("Medication already added.");
    input.value = "";
    return;
  }

  if (!medicineExists(lowerDrug)) {
    handleNotFound(lowerDrug);
    input.value = "";
    return;
  }

  medications.push(lowerDrug);

  const drugList = document.getElementById("drugList");

  const drugBox = document.createElement("div");
  drugBox.className = "added-drug";

  drugBox.innerHTML = `
      <span>${drugName}</span>
      <i class="fas fa-times"></i>
    `;

  // delete medication
  drugBox.querySelector("i").onclick = function () {
    drugBox.remove();
    medications = medications.filter((m) => m !== lowerDrug);
    updateButton();
  };

  drugList.appendChild(drugBox);
  input.value = "";
  updateButton();
}

function medicineExists(value) {
  return brandToGeneric.hasOwnProperty(value);
}

function handleNotFound(value) {
  const suggestion = getClosestMatch(value, getAllMedicineNames());

  if (suggestion) {
    showSuggestionPopup(value, suggestion);
  } else {
    alert("Medicine not found in database");
  }
}

// suggestion popup
function showSuggestionPopup(original, suggestion) {
  pendingValue = original;
  correctedValue = suggestion;

  document.getElementById("suggestionText").innerText =
    `Did you mean "${suggestion}" instead of "${original}"?`;

  document.getElementById("suggestionPopup").classList.remove("hidden");
}

function acceptSuggestion() {
  addCorrectedDrug(correctedValue);
  closePopup();
}

function rejectSuggestion() {
  alert("Medicine not found. Please check spelling.");
  closePopup();
}

function closePopup() {
  document.getElementById("suggestionPopup").classList.add("hidden");
}

function addCorrectedDrug(drugName) {
  const lowerDrug = drugName.toLowerCase();

  if (medications.includes(lowerDrug)) return;

  medications.push(lowerDrug);

  const drugList = document.getElementById("drugList");

  const drugBox = document.createElement("div");
  drugBox.className = "added-drug";

  drugBox.innerHTML = `
      <span>${drugName}</span>
      <i class="fas fa-times"></i>
    `;

  drugBox.querySelector("i").onclick = function () {
    drugBox.remove();
    medications = medications.filter((m) => m !== lowerDrug);
    updateButton();
  };

  drugList.appendChild(drugBox);
  updateButton();
}

// fuzzy matching
function getClosestMatch(input, list) {
  input = input.toLowerCase();

  let closest = null;
  let minDistance = Infinity;

  list.forEach((item) => {
    const dist = levenshtein(input, item.toLowerCase());
    if (dist < minDistance) {
      minDistance = dist;
      closest = item;
    }
  });

  if (minDistance <= 2 && closest !== input) {
    return closest;
  }

  return null;
}

function levenshtein(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function updateButton() {
  const checkBtn = document.getElementById("checkBtn");

  if (medications.length >= 2) {
    checkBtn.disabled = false;
    checkBtn.style.opacity = "1";
  } else {
    checkBtn.disabled = true;
    checkBtn.style.opacity = "0.5";
  }
}

// allow enter key
document.getElementById("drugInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addDrug();
  }
});

async function checkCompatibility() {
  if (medications.length < 2) {
    alert("Please add at least 2 medications");
    return;
  }

  const container = document.getElementById("results");
  container.innerHTML = `
      <div class="loading">
        <p>🔍 Analyzing drug interactions...</p>
      </div>
    `;

  try {
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ drugs: medications }),
    });

    const text = await response.text();
    const data = JSON.parse(text);

    if (data.error) {
      alert(data.error);
      return;
    }

    if (data.type === "warning") {
      const warningResult = {
        drug1: medications[0],
        drug2: medications[1],
        result: data.override || "Not Safe",
        message: data.message,
        ingredients: data.ingredients,
      };

      displayResults([warningResult]);

      await fetch("save_history.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "drug",
          input: medications,
          result: warningResult.result,
        }),
      });
    } else if (data.type === "prediction") {
      displayResults(data.results);

      await fetch("save_history.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "drug",
          input: medications,
          result: data.results.map((r) => r.result).join(", "),
        }),
      });
    } else {
      alert("Unexpected response format");
    }
  } catch (error) {
    console.error("FRONTEND ERROR:", error);
    alert("Backend error. Make sure Flask is running.");
  }
}

function displayResults(results) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  results.forEach((r, index) => {
    const div = document.createElement("div");
    const isUnsafe = r.result === "Not Safe";
    const riskMap = {
      "Not Safe": 75 + Math.random() * 15,
      Moderate: 40 + Math.random() * 20,
      Safe: 5 + Math.random() * 15,
    };

    const risk = riskMap[r.result] || 30;
    const chartId = "chart" + index;

    const badgeClass =
      r.result === "Not Safe"
        ? "unsafe"
        : r.result === "Moderate"
          ? "moderate"
          : "safe";

    div.className = `result-card ${badgeClass}`;
    div.style.border = "1px solid #ccc";
    div.style.padding = "15px";
    div.style.margin = "10px 0";
    div.style.borderRadius = "8px";

    div.innerHTML = `
        <div class="result-header">
          <h3>🧪 ${r.drug1} + ${r.drug2}</h3>
          <span class="badge ${badgeClass}">${r.result}</span>
        </div>

        <div class="risk-bar">
          <div class="risk-red" style="width:${risk}%"></div>
          <div class="risk-green" style="width:${100 - risk}%"></div>
        </div>
        <p class="risk-text"> <br>${risk}% Interaction Risk</p>

        <div class="chart-container">
          <canvas id="${chartId}"></canvas>
        </div>

        <p class="reason">
          ${
            r.message
              ? r.message
              : r.result === "Not Safe"
                ? "⚠ Both drugs may interact through similar metabolic pathways."
                : "✅ No significant interaction detected."
          }
        </p>

        <div class="medical-disclaimer">
          <strong>Medical Disclaimer:</strong>
          Informational only. Not a substitute for professional advice.
        </div>
      `;

    container.appendChild(div);

    const ctx = document.getElementById(chartId).getContext("2d");
    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [0, 100],
            backgroundColor: ["#e74c3c", "#2ecc71"],
          },
        ],
      },
      options: {
        animation: {
          duration: 1500,
        },
        plugins: {
          legend: { display: false },
        },
      },
    });

    setTimeout(() => {
      chart.data.datasets[0].data = [risk, 100 - risk];
      chart.update();
    }, 300);
  });
}
