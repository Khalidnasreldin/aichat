const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");

// API setup
// import SECRECT_API_KEY from "./apikey.js";

const API_KEY = "AIzaSyA9UVtKKKBqPYPMsZdrZFOw74d6lVewGrM";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// stroring user's data
const userData = {
    message: null
}

const chatHistory = []

// Create usre message element with dynamic class
const createMessageElement = (content, classes) => {
    const div = document.createElement("div");
    div.classList.add("message", classes);
    div.innerHTML = content;
    return div;
}
// generate bot response using Google Gemini API
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");
    // Add user message to chat history
    chatHistory.push({role: "user", parts: [{text: userData.message}]});
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [chatHistory]
        })
    }
    try {
        // Fetch the response from Gemini API
        const response = await fetch(API_URL, requestOptions)
        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message);

        // Extract and display bot's response
        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        messageElement.innerText = apiResponseText;
        
        // add bot response to chatHistory
        chatHistory.push({role: "model", parts: [{text: apiResponseText}]});

    } catch (error) {
        console.log(error);
    } finally {
        incomingMessageDiv.classList.remove('thinking');
        chatBody.scrollTo({
            top: chatBody.scrollHeight,
            behavior: "smooth"
        });
    }
}
// Handle user outgoing message
const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";
    const messageContent = `<div class="message-text"></div>`;
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector('.message-text').innerText = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({
        top: chatBody.scrollHeight,
        behavior: "smooth"
    });
    // simulate bot response with thinking animation
    setTimeout(() => {
        const messageContent = `
                <div class="message-text">
                    <div class="thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>
        `;
        const incomingMessageDiv = createMessageElement(messageContent, "bot-message");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({
            top: chatBody.scrollHeight,
            behavior: "smooth"
        });
        generateBotResponse(incomingMessageDiv);
    }, 600)
}
// Handle enter key when sending message
messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if(e.key === "Enter" && userMessage) {
        handleOutgoingMessage(e);
    }
});
sendMessageButton.addEventListener("click", (e)=> handleOutgoingMessage(e));