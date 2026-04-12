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

// find common ingredients
function findCommonIngredients(drug1, drug2) {
  const ing1 = brandToGeneric[drug1] || [];
  const ing2 = brandToGeneric[drug2] || [];
  return ing1.filter((i) => ing2.includes(i));
}

// generate main reasoning
function generateReason(drug1, drug2, result) {
  const common = findCommonIngredients(drug1, drug2);

  if (common.length > 0) {
    return {
      reason: `Both medicines contain ${common.join(", ")}.`,
      risk: `Taking them together may lead to overdose or increased side effects.`,
      common: common,
    };
  }

  if (result === "Not Safe") {
    return {
      reason: "These drugs may interact through metabolic pathways.",
      risk: "May cause harmful side effects when combined.",
      common: [],
    };
  }

  return {
    reason: "No common harmful interaction detected.",
    risk: "Safe when used as prescribed.",
    common: [],
  };
}

async function getAdditionalInfo(drug1, drug2) {
  try {
    const res1 = await fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${drug1}"&limit=1`,
    );
    const res2 = await fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${drug2}"&limit=1`,
    );
    const data1 = await res1.json();
    const data2 = await res2.json();

    function extractCommonEffects(data) {
      if (!data.results || !data.results[0].adverse_reactions) return [];
      const text = data.results[0].adverse_reactions.join(" ").toLowerCase();
      // common keywords to extract
      const keywords = [
        "nausea",
        "diarrhea",
        "headache",
        "dizziness",
        "fatigue",
        "muscle pain",
        "joint pain",
        "abdominal pain",
        "fever",
        "vomiting",
      ];

      let found = [];
      keywords.forEach((k) => {
        if (text.includes(k)) found.push(k);
      });
      return found;
    }
    const effects1 = extractCommonEffects(data1);
    const effects2 = extractCommonEffects(data2);
    // merge + remove duplicates
    const combined = [...new Set([...effects1, ...effects2])];
    return combined.length > 0 ? combined : null;
  } catch (e) {
    console.error("API Error:", e);
    return null;
  }
}

function addDrug() {
  const input = document.getElementById("drugInput");
  const drugName = input.value.trim();

  if (drugName === "") return;

  if (!Object.keys(brandToGeneric).length) {
    alert("Loading medicine database... please try again.");
    return;
  }

  const lowerDrug = drugName.toLowerCase();

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
    const data = await response.json();
    if (data.error) {
      alert(data.error);
      return;
    }

    let resultsToSave = [];
    if (data.type === "warning") {
      const warningResult = {
        drug1: medications[0],
        drug2: medications[1],
        result: data.override || "Not Safe",
        message: data.message,
      };
      resultsToSave = [warningResult];
      await displayResults(resultsToSave);
    } else if (data.type === "prediction") {
      resultsToSave = data.results;
      await displayResults(resultsToSave);
    } else {
      alert("Unexpected response format");
      return;
    }

    await fetch("save_history.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "drug",
        input: medications,
        result: resultsToSave.map((r) => r.result).join(", "),
      }),
    });
  } catch (error) {
    console.error("ERROR:", error);
    alert("Backend error. Make sure Flask server is running.");
  }
}

async function displayResults(results) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  for (const r of results) {
    const div = document.createElement("div");

    const badgeClass = r.result === "Not Safe" ? "unsafe" : "safe";

    const explanation = generateReason(r.drug1, r.drug2, r.result);
    const apiInfo = await getAdditionalInfo(r.drug1, r.drug2);

    const ing1 = brandToGeneric[r.drug1] || [];
    const ing2 = brandToGeneric[r.drug2] || [];

    div.className = `result-card ${badgeClass}`;

    div.innerHTML = `
    <div class="result-hero ${badgeClass}">
      <div class="result-status">${r.result === "Not Safe" ? "⚠ NOT SAFE" : "✅ SAFE"}</div>
      <div class="result-drugs">${r.drug1} + ${r.drug2}</div>
    </div>

    <div class="card ">
      <h3>🤔 Why this result?</h3>
      <p>${explanation.reason}</p>
      <p class="note"><strong>⚠ Risk:</strong> ${explanation.risk}</p>
    </div>

    <div class="card ">
      <h3>🧬 Ingredient Comparison</h3>
      <table class="ingredient-table">
        <tr>
          <th>${r.drug1}</th>
          <th>${r.drug2}</th>
        </tr>
        <tr>
          <td>${ing1.join("<br>")}</td>
          <td>${ing2.join("<br>")}</td>
        </tr>
      </table>

      ${
        explanation.common.length > 0
          ? `<p class="highlight">⚠ Common Ingredient: ${explanation.common.join(", ")}</p>`
          : `<p class="safe-text">✅ No common ingredients</p>`
      }
    </div>

    ${
      apiInfo && apiInfo.length > 0
        ? `
      <div class="card">
        <h3>Possible Side Effects</h3>
        <ul class="effects-list">
          ${apiInfo.map((e) => `<li>${e}</li>`).join("")}
        </ul>
        <p class="note">
          ⚠ Showing only the most common side effects. There may be other side effects not listed.
        </p>
      </div>`
        : `
      <div class="card">
        <h3>👉 Possible Side Effects</h3>
        <p>No common side effects data available.</p>
      </div>`
    }

    <div class="card ">
      <h3>💡 Recommendation</h3>
      <p>${
        r.result === "Not Safe"
          ? "Avoid taking these medicines together unless prescribed by a doctor."
          : "Safe when taken as directed, but consult a professional if unsure."
      }</p>
    </div>

    <div class="card disclaimer">
      <strong>Medical Disclaimer:</strong>
      Informational only. Not a substitute for professional advice.
    </div>
  `;
    container.appendChild(div);

    div.style.opacity = "0";
    div.style.transform = "translateY(20px)";

    setTimeout(() => {
      div.style.transition = "all 0.5s ease";
      div.style.opacity = "1";
      div.style.transform = "translateY(0)";
    }, 100);
  }
}
