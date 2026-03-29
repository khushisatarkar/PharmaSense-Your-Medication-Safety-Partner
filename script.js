let medications = [];

function addDrug() {
  const input = document.getElementById("drugInput");
  const drugName = input.value.trim();

  if (drugName === "") return;

  // prevent duplicates
  if (medications.includes(drugName.toLowerCase())) {
    alert("Medication already added.");
    input.value = "";
    return;
  }

  medications.push(drugName.toLowerCase());

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
    medications = medications.filter((m) => m !== drugName.toLowerCase());
    updateButton();
  };

  drugList.appendChild(drugBox);

  input.value = "";

  updateButton();
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
    } else if (data.type === "prediction") {
      displayResults(data.results);
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
      "Not Safe": 85,
      Moderate: 60,
      Safe: 20,
    };

    const risk = riskMap[r.result] || 30;
    const chartId = "chart" + index;

    div.style.border = "1px solid #ccc";
    div.style.padding = "15px";
    div.style.margin = "10px 0";
    div.style.borderRadius = "8px";

    div.innerHTML = `
      <h3>🧪 ${r.drug1} + ${r.drug2}</h3>

      <p style="color:${isUnsafe ? "red" : "green"}; font-weight:bold;">
        ${r.result} (${risk}%)
      </p>

      <div style="width:200px; margin:auto;">
        <canvas id="${chartId}"></canvas>
      </div>

      <p>
        ${
          r.message
            ? `${r.message}<br><b>Common Ingredient:</b> ${
                r.ingredients ? r.ingredients.join(", ") : ""
              }`
            : isUnsafe
              ? "⚠ High interaction risk. Consult a doctor."
              : "✅ Low interaction risk."
        }
      </p>
    `;

    container.appendChild(div);

    const ctx = document.getElementById(chartId).getContext("2d");

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Risk", "Safe"],
        datasets: [
          {
            data: [risk, 100 - risk],
            backgroundColor: ["#e74c3c", "#2ecc71"],
          },
        ],
      },
    });
  });
}
