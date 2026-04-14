console.log(USER_ID);

let allergies = [];
let currentMeds = [];
let brandToGeneric = {};
let medicines = [];
let dosageData = {};

window.onload = async function () {
  await loadMedicineData();
  await loadDosageData();

  console.log("USER_ID inside onload:", USER_ID);

  try {
    const res = await fetch("http://127.0.0.1:5000/profile?user_id=" + USER_ID);
    const data = await res.json();
    if (data.age) document.getElementById("age").value = data.age;
    if (data.allergies) {
      data.allergies.forEach(addAllergyToUI);
      allergies = [...data.allergies];
    }
    if (data.currentMeds) {
      data.currentMeds.forEach(addMedToUI);
      currentMeds = [...data.currentMeds];
    }
  } catch (err) {
    console.log("No profile data found");
  }
};

async function loadMedicineData() {
  const res = await fetch("brand_to_generic.json");
  const data = await res.json();
  for (let brand in data) {
    const lowerBrand = brand.toLowerCase();
    brandToGeneric[lowerBrand] = data[brand];
    medicines.push(lowerBrand);
    data[brand].forEach((g) => {
      medicines.push(g.toLowerCase());
    });
  }

  // remove duplicates
  medicines = [...new Set(medicines)];
}

async function loadDosageData() {
  const res = await fetch("dosage.json");
  dosageData = await res.json();
}

function addAllergy() {
  const input = document.getElementById("allergyInput");
  const value = input.value.trim().toLowerCase();
  if (!value || allergies.includes(value)) return;
  allergies.push(value);
  addAllergyToUI(value);
  input.value = "";
}

function addAllergyToUI(value) {
  const container = document.getElementById("allergyList");
  const div = document.createElement("div");
  div.className = "added-drug";
  div.innerHTML = `<span>${value}</span><i class="fas fa-times"></i>`;
  div.querySelector("i").onclick = function () {
    div.remove();
    allergies = allergies.filter((a) => a !== value);
  };
  container.appendChild(div);
}

function addMed() {
  const input = document.getElementById("medInput");
  const value = input.value.trim().toLowerCase();
  if (!value || currentMeds.includes(value)) return;
  currentMeds.push(value);
  addMedToUI(value);
  input.value = "";
}

function addMedToUI(value) {
  const container = document.getElementById("medList");
  const div = document.createElement("div");
  div.className = "added-drug";
  div.innerHTML = `<span>${value}</span><i class="fas fa-times"></i>`;
  div.querySelector("i").onclick = function () {
    div.remove();
    currentMeds = currentMeds.filter((m) => m !== value);
  };
  container.appendChild(div);
}

document.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    if (document.activeElement.id === "allergyInput") addAllergy();
    if (document.activeElement.id === "medInput") addMed();
  }
});

function medicineExists(value) {
  return medicines.includes(value);
}

// spell check
function handleNotFound(value) {
  const suggestion = getClosestMatch(value, medicines);
  if (suggestion) {
    showSuggestionPopup(value, suggestion);
  } else {
    alert("Medicine not found in database");
  }
}

let correctedValue = "";

function showSuggestionPopup(original, suggestion) {
  correctedValue = suggestion;
  document.getElementById("suggestionText").innerText =
    `Did you mean "${suggestion}" instead of "${original}"?`;
  document.getElementById("suggestionPopup").classList.remove("hidden");
}

function acceptSuggestion() {
  document.getElementById("medicine").value = correctedValue;
  closePopup();
  checkSafety();
}

function rejectSuggestion() {
  closePopup();
}

function closePopup() {
  document.getElementById("suggestionPopup").classList.add("hidden");
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
  return minDistance <= 2 && closest !== input ? closest : null;
}

function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1,
            );
    }
  }
  return matrix[b.length][a.length];
}

function checkDosageSafety(medicine, age, dosage) {
  const ageGroup = age < 12 ? "child" : "adult";

  if (!dosageData[medicine]) {
    return {
      safe: true,
      message: "No dosage data available",
      recommended: null,
    };
  }

  const rule = dosageData[medicine][ageGroup];

  if (!rule || !rule.safe) {
    return {
      safe: false,
      message: "Not recommended for this age group",
      recommended: null,
    };
  }

  if (dosage > rule.max_dosage) {
    return {
      safe: false,
      message: "Dosage exceeds safe limit",
      recommended: `${rule.max_dosage} ${rule.unit}`,
    };
  }

  return {
    safe: true,
    message: "Dosage within safe range",
    recommended: `${rule.max_dosage} ${rule.unit}`,
  };
}

async function checkSafety() {
  let inputMedicine = document
    .getElementById("medicine")
    .value.trim()
    .toLowerCase();
  if (!inputMedicine) return alert("Enter medicine");
  if (!medicineExists(inputMedicine)) {
    handleNotFound(inputMedicine);
    return;
  }
  const age = parseInt(document.getElementById("age").value);
  const dosageAmount = parseFloat(
    document.getElementById("dosageAmount").value,
  );
  if (!age || !dosageAmount) {
    return alert("Enter age and dosage");
  }
  let finalMedicine = brandToGeneric[inputMedicine]
    ? brandToGeneric[inputMedicine][0].toLowerCase()
    : inputMedicine;
  const dosageCheck = checkDosageSafety(finalMedicine, age, dosageAmount);

  try {
    const res = await fetch("http://127.0.0.1:5000/safety", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        medicine: finalMedicine,
        age,
        dosageAmount,
        allergies,
        currentMeds,
      }),
    });

    const data = await res.json();
    let finalResult = data.result;

    // dosage override
    if (!dosageCheck.safe) finalResult = "Not Safe";

    // allergy conflict
    const hasAllergyConflict = data.ingredients?.some((ing) =>
      allergies.includes(ing.toLowerCase()),
    );
    if (hasAllergyConflict) finalResult = "Not Safe";

    // else if (data.ingredients?.some(ing => allergies.includes(ing.toLowerCase())))

    // side effects
    const sideEffectData = await getAdditionalInfo(finalMedicine);

    displaySafetyResult({
      medicine: inputMedicine,
      generic: finalMedicine,
      result: finalResult,
      dosageMessage: dosageCheck.message,
      recommended: dosageCheck.recommended,
      allergies,
      currentMeds,
      ingredients: data.ingredients || [],
      sideEffects: sideEffectData || [],
    });

    await fetch("save_history.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "safety",
        input: {
          medicine: inputMedicine,
          generic: finalMedicine,
          age,
          dosageAmount,
          allergies,
          currentMeds,
        },
        result: finalResult,
      }),
    });
  } catch (err) {
    console.log(err);
    alert("Backend error");
  }
}

async function getAdditionalInfo(drug) {
  try {
    const res = await fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${drug}"&limit=1`,
    );
    const data = await res.json();
    if (!data.results || !data.results[0].adverse_reactions) return [];
    const text = data.results[0].adverse_reactions.join(" ").toLowerCase();
    const keywords = [
      "nausea",
      "diarrhea",
      "headache",
      "dizziness",
      "fatigue",
      "vomiting",
      "abdominal pain",
      "fever",
      "rash",
      "bleeding",
      "drowsiness",
    ];
    return keywords.filter((k) => text.includes(k));
  } catch (e) {
    console.error("API Error:", e);
    return [];
  }
}

function displaySafetyResult(data) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  const isUnsafe = data.result === "Not Safe";

  let reasonText = "";

  if (data.dosageMessage.includes("exceeds")) {
    reasonText =
      "The entered dosage exceeds the safe limit for your age group, which may increase the risk of adverse effects.";
  } else if (data.dosageMessage.includes("Not recommended")) {
    reasonText =
      "This medication is not recommended for your age group based on standard medical guidelines.";
  } else if (
    data.ingredients?.some((ing) => allergies.includes(ing.toLowerCase()))
  ) {
    reasonText = `This medicine may not be suitable due to your recorded allergies (${data.allergies.join(
      ", ",
    )}).`;
  } else {
    reasonText =
      "This medication is considered safe based on your inputs and standard safety checks.";
  }

  const div = document.createElement("div");
  div.className = `result-card ${isUnsafe ? "unsafe" : "safe"}`;
  div.innerHTML = `
    <div class="result-hero ${isUnsafe ? "unsafe" : "safe"}">
      <div class="result-status">${isUnsafe ? "⚠ NOT SAFE" : "✅ SAFE"}</div>
      <div class="result-drugs">
        ${data.medicine} 
        ${
          data.generic && data.generic !== data.medicine
            ? `<span class="generic-name">(${data.generic})</span>`
            : ""
        }
      </div>
    </div>

    <div class="card">
      <h3>🤔 Why this result?</h3>
      <p>${reasonText}</p>
      <p class="note">${data.dosageMessage}</p>
    </div>

    <div class="card">
      <h3>🧬 Ingredients</h3>
      <p>${data.ingredients.join(", ") || "No ingredient data available"}</p>
    </div>

    <div class="card">
      <h3>⚠ Possible Side Effects</h3>
      ${
        data.sideEffects.length > 0
          ? `<ul class="effects-list">${data.sideEffects
              .map((e) => `<li>${e}</li>`)
              .join("")}</ul>`
          : `<p>No common side effects available.</p>`
      }
      <p class="note">
        ⚠ Showing only the most common side effects. There may be additional risks not listed.
      </p>
    </div>

    <div class="card">
      <h3>💡 Recommendation</h3>
      <p>
        ${
          isUnsafe
            ? "Avoid using this medication without medical supervision."
            : "Safe to use within recommended limits, but consult a healthcare professional if unsure."
        }
      </p>

      ${
        data.recommended
          ? `<p class="highlight"><strong>Recommended dosage:</strong> ${data.recommended}</p>`
          : ""
      }
    </div>

    <div class="card disclaimer">
      <strong>Medical Disclaimer:</strong>
      Informational only. Not a substitute for professional advice.
    </div>
  `;

  container.appendChild(div);

  // animation
  div.style.opacity = "0";
  div.style.transform = "translateY(20px)";

  setTimeout(() => {
    div.style.transition = "all 0.5s ease";
    div.style.opacity = "1";
    div.style.transform = "translateY(0)";
  }, 100);
}
