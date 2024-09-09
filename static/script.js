document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const fileInput = document.getElementById('file-input');
    const messagesDiv = document.getElementById('messages');
    const chatContainer = document.getElementById('chat-container');

    const sendMessage = async () => {
        const prompt = userInput.value;
        if (prompt) {
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

            messagesDiv.scrollTop = messagesDiv.scrollHeight; // 스크롤을 아래로 이동
        }
    };

    const handleFileUpload = () => {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                messagesDiv.innerHTML += `<div class="message user-message"><img src="${reader.result}" alt="Image" class="uploaded-image"></div>`;
                fileInput.value = ''; // 파일 입력 필드 초기화
                messagesDiv.scrollTop = messagesDiv.scrollHeight; // 스크롤을 아래로 이동
            };
            reader.readAsDataURL(file);
        }
    };

    sendButton.addEventListener('click', () => {
        sendMessage();
        handleFileUpload();
    });

    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
            handleFileUpload();
        }
    });

    fileInput.addEventListener('change', handleFileUpload);

    // 입력창에 포커스가 가면 자동으로 스크롤을 아래로 이동
    userInput.addEventListener('focus', () => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    });
});
