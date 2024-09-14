document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const messagesDiv = document.getElementById('messages');
    const chatContainer = document.getElementById('chat-container');
    const logoContainer = document.querySelector('.logo-container');

    let isFirstMessageSent = false;

    const sendMessage = async () => {
        const prompt = userInput.value;
        if (prompt) {
            // Append user message to messagesDiv
            messagesDiv.innerHTML += `<div class="message user-message">${prompt}</div>`;
            userInput.value = '';

            try {
                const response = await fetch('/process_message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ prompt })
                });
                const data = await response.json();

                if (data.response) {
                    messagesDiv.innerHTML += `<div class="message assistant-message">${data.response}</div>`;
                } else if (data.error) {
                    messagesDiv.innerHTML += `<div class="message assistant-message">${data.error}</div>`;
                }
            } catch (error) {
                console.error('Error:', error);
                messagesDiv.innerHTML += `<div class="message assistant-message">An error occurred. Please try again.</div>`;
            }

            // Scroll to the bottom of the messagesDiv
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            // Display chat container and hide logo if it's the first message
            if (!isFirstMessageSent) {
                logoContainer.style.display = 'none';
                chatContainer.style.display = 'flex';
                messagesDiv.classList.add('expanded'); // 메시지 박스 크기 변경
                isFirstMessageSent = true;
            }
        }
    };

    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            if (event.shiftKey) {
                event.preventDefault();
                userInput.value += '\n';
                adjustTextareaHeight();
            } else {
                event.preventDefault();
                sendMessage();
            }
        }
    });

    // Handle window resize events
    window.addEventListener('resize', () => {
        if (document.activeElement === userInput) {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    });

    // Ensure that messagesDiv scrolls to bottom on input focus
    userInput.addEventListener('focus', () => {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
});
