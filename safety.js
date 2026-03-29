console.log(USER_ID);
let allergies = [];
let currentMeds = [];

window.onload = async function () {
  console.log("USER_ID inside onload:", USER_ID);
  try {
    const res = await fetch("http://127.0.0.1:5000/profile?user_id=" + USER_ID);
    const data = await res.json();

    if (data.age) {
      document.getElementById("age").value = data.age;
    }

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

  div.innerHTML = `
    <span>${value}</span>
    <i class="fas fa-times"></i>
  `;

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

  div.innerHTML = `
    <span>${value}</span>
    <i class="fas fa-times"></i>
  `;

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

async function checkSafety() {
  const medicine = document
    .getElementById("medicine")
    .value.trim()
    .toLowerCase();
  const age = document.getElementById("age").value;
  const dosageAmount = document.getElementById("dosageAmount").value;

  if (!medicine || !age || !dosageAmount) {
    alert("Enter medicine, age and dosage");
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:5000/safety", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        medicine,
        age,
        dosageAmount,
        allergies,
        currentMeds,
      }),
    });

    const data = await res.json();
    displaySafetyResult(data);
  } catch (err) {
    alert("Backend error");
    console.log(err);
  }
}

function displaySafetyResult(data) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  const div = document.createElement("div");
  div.className = "result-card";
  const isUnsafe = data.result.includes("Not") || data.result.includes("❌");
  div.innerHTML = `
    <h3>${data.medicine}</h3>
    <p class="${isUnsafe ? "unsafe" : "safe"}">
      ${data.result}
    </p>
    <p class="desc">${data.message || ""}</p>

    ${
      data.ingredients && data.ingredients.length
        ? `<p><b>Ingredients:</b> ${data.ingredients.join(", ")}</p>`
        : ""
    }
  `;
  container.appendChild(div);
}
