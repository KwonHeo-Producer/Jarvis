#script.js
document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const messagesDiv = document.getElementById('messages');
    const chatContainer = document.getElementById('chat-container');
    const logoContainer = document.querySelector('.logo-container');

    // 새로고침 시마다 세션 ID를 초기화합니다.
    localStorage.removeItem('sessionId'); // 이전 세션 ID 삭제
    const sessionId = uuidv4(); // 새로운 UUID 생성
    localStorage.setItem('sessionId', sessionId); // 새로 생성한 UUID 저장

    let isFirstMessageSent = false;

    const sendMessage = async () => {
        const prompt = userInput.value.trim();
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
                    body: JSON.stringify({ prompt, session_id: sessionId }) // Include session_id
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
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent default Enter action (new line)
            sendMessage();
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

    // Function to generate a UUID
    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
});
