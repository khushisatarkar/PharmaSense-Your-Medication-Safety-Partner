// function toggleChat() {
//   let chat = document.getElementById("chatbot-container");

//   if (chat.style.display === "flex") {
//     chat.style.display = "none";
//   } else {
//     chat.style.display = "flex";
//   }
// }

// const intents = [
//   {
//     keywords: ["new pills", "new medicine", "started medicine"],
//     response: "Redirecting to update medicines...",
//     page: "./profile.php",
//   },
//   {
//     keywords: ["allergy", "new allergy"],
//     response: "Redirecting to update allergies...",
//     page: "./profile.php",
//   },
//   {
//     keywords: ["edit profile", "update profile"],
//     response: "Opening your profile...",
//     page: "./profile.php",
//   },
//   {
//     keywords: ["interaction", "drug interaction", "react"],
//     response: "Opening interaction checker...",
//     page: "./drug.php",
//   },
//   {
//     keywords: ["safe", "is it safe"],
//     response: "Checking safety...",
//     page: "./safety.php",
//   },
//   {
//     keywords: ["home remedy", "remedy"],
//     response: "Showing home remedies...",
//     page: "./homeremedies.php",
//   },
// ];

// function sendMessage() {
//   let inputField = document.getElementById("userInput");
//   let input = inputField.value.toLowerCase();
//   let chatbox = document.getElementById("chatbox");

//   if (input.trim() === "") return;

//   chatbox.innerHTML += `<p><b>You:</b> ${input}</p>`;

//   for (let intent of intents) {
//     for (let keyword of intent.keywords) {
//       if (input.includes(keyword)) {
//         chatbox.innerHTML += `<p><b>Bot:</b> ${intent.response}</p>`;

//         chatbox.scrollTop = chatbox.scrollHeight;
//         inputField.value = "";

//         setTimeout(() => {
//           window.location.href = intent.page;
//         }, 1200);

//         return;
//       }
//     }
//   }

//   chatbox.innerHTML += `<p><b>Bot:</b> Try asking about medicines, allergies, or remedies.</p>`;

//   chatbox.scrollTop = chatbox.scrollHeight;
//   inputField.value = "";
// }

function toggleChat() {
  let chat = document.getElementById("chatbot-container");

  if (chat.style.display === "flex") {
    chat.style.display = "none";
  } else {
    chat.style.display = "flex";

    // show welcome message only once
    if (!chat.dataset.loaded) {
      addBotMessage("Hi! 👋 How can I help you today?");
      chat.dataset.loaded = true;
    }
  }
}

function addUserMessage(text) {
  let chatbox = document.getElementById("chatbox");
  chatbox.innerHTML += `<div class="message user">${text}</div>`;
  chatbox.scrollTop = chatbox.scrollHeight;
}

function addBotMessage(text) {
  let chatbox = document.getElementById("chatbox");
  chatbox.innerHTML += `<div class="message bot">${text}</div>`;
  chatbox.scrollTop = chatbox.scrollHeight;
}

function addBotButton(text, link, label) {
  let chatbox = document.getElementById("chatbox");

  chatbox.innerHTML += `
        <div class="message bot">
            ${text}<br>
            <a href="${link}" class="chat-btn">${label}</a>
        </div>
    `;

  chatbox.scrollTop = chatbox.scrollHeight;
}

function sendMessage() {
  let inputField = document.getElementById("userInput");
  let input = inputField.value.toLowerCase();

  if (input.trim() === "") return;

  addUserMessage(input);
  inputField.value = "";

  if (
    input.includes("interaction") ||
    input.includes("together") ||
    input.includes("combine")
  ) {
    addBotButton(
      "You can check drug interactions here:",
      "drug.php",
      "Go To Drug Interaction",
    );
  } else if (input.includes("safe") || input.includes("safety")) {
    addBotButton(
      "Let’s check your personalized safety:",
      "safety.php",
      "Go To Safety Analysis",
    );
  } else if (input.includes("remedy") || input.includes("home")) {
    addBotButton(
      "Here are some home remedies:",
      "homeremedies.php",
      "View Home Remedies",
    );
  } else if (
    input.includes("profile") ||
    input.includes("allergy") ||
    input.includes("medicine")
  ) {
    addBotButton(
      "You can update your profile here:",
      "profile.php",
      "Go To Profile",
    );
  } else {
    addBotMessage(
      "I can help with:\n• Drug interactions\n• Safety checks\n• Home remedies\nTry asking something like: 'Can I take Crocin and Corex together?'",
    );
  }
}
