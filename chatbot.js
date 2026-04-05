function toggleChat() {
  let chat = document.getElementById("chatbot-container");

  if (chat.style.display === "flex") {
    chat.style.display = "none";
  } else {
    chat.style.display = "flex";

    // show welcome message + suggestions only once
    if (!chat.dataset.loaded) {
      addBotMessage("Hi! 👋 How can I help you today?");
      document.getElementById("suggestions").style.display = "flex";
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

  // hide suggestions after first interaction
  document.getElementById("suggestions").style.display = "none";

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

function quickMessage(text) {
  let inputField = document.getElementById("userInput");
  inputField.value = text;
  sendMessage();
}
