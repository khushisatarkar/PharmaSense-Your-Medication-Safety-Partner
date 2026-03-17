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

    console.log("Raw response:", response);

    const text = await response.text(); // 👈 IMPORTANT
    console.log("Response text:", text);

    const data = JSON.parse(text); // 👈 safer debugging
    console.log("Parsed data:", data);

    if (data.error) {
      alert(data.error);
      return;
    }

    if (data.type === "warning") {
      displayWarning(data);
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

function displayWarning(data) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  const div = document.createElement("div");

  div.style.border = "1px solid red";
  div.style.padding = "15px";
  div.style.margin = "10px 0";
  div.style.borderRadius = "8px";
  div.style.backgroundColor = "#ffe6e6";

  div.innerHTML = `
        <h3>⚠ Warning</h3>
        <p>${data.message}</p>
        <p><b>Common Ingredient:</b> ${data.ingredients.join(", ")}</p>
    `;

  container.appendChild(div);
}

function displayResults(results) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  results.forEach((r) => {
    const div = document.createElement("div");

    const isUnsafe = r.result.includes("Not");

    div.style.border = "1px solid #ccc";
    div.style.padding = "15px";
    div.style.margin = "10px 0";
    div.style.borderRadius = "8px";

    div.innerHTML = `
            <h3>🧪 ${r.drug1} + ${r.drug2}</h3>
            <p style="color: ${isUnsafe ? "red" : "green"}; font-weight: bold;">
                ${r.result}
            </p>
            <p>
                ${
                  isUnsafe
                    ? "Potential interaction detected. Consult a doctor."
                    : "No major interaction detected."
                }
            </p>
        `;

    container.appendChild(div);
  });
}
