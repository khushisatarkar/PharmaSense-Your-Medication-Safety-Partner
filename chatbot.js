function toggleChat() {
    let chat = document.getElementById("chatbot-container");
    chat.style.display = (chat.style.display === "none") ? "flex" : "none";
}

const intents = [
    {
        keywords: ["new pills", "new medicine", "started medicine"],
        response: "Redirecting to update medicines...",
        page: "./profile.php"
    },
    {
        keywords: ["allergy", "new allergy"],
        response: "Redirecting to update allergies...",
        page: "./profile.php"
    },
    {
        keywords: ["edit profile", "update profile"],
        response: "Opening your profile...",
        page: "./profile.php"
    },
    {
        keywords: ["interaction", "drug interaction", "react"],
        response: "Opening interaction checker...",
        page: "./drug.php"
    },
    {
        keywords: ["safe", "is it safe"],
        response: "Checking safety...",
        page: "./safety.php"
    },
    {
        keywords: ["home remedy", "remedy"],
        response: "Showing home remedies...",
        page: "./homeremedies.php"
    }
];

function sendMessage() {
    let input = document.getElementById("userInput").value.toLowerCase();
    let chatbox = document.getElementById("chatbox");

    chatbox.innerHTML += `<p><b>You:</b> ${input}</p>`;

    for (let intent of intents) {
        for (let keyword of intent.keywords) {
            if (input.includes(keyword)) {

                chatbox.innerHTML += `<p><b>Bot:</b> ${intent.response}</p>`;

                setTimeout(() => {
                    window.location.href = intent.page;
                }, 1200);

                return;
            }
        }
    }

    chatbox.innerHTML += `<p><b>Bot:</b> Try asking about medicines, allergies, or remedies.</p>`;
}