// chat.js
import { sendMessage } from './sendMessage.js';
import initImageUpload from './image.js';

const initChat = () => {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const messagesDiv = document.getElementById('messages');
    const chatContainer = document.getElementById('chat-container');
    const logoContainer = document.querySelector('.logo-container');
    const fileInput = document.getElementById('image-upload'); // 이미지 업로드 요소
    let isFirstMessageSent = false;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    const adjustTextareaHeight = () => {
        userInput.style.height = 'auto';
        const newHeight = Math.min(Math.max(userInput.scrollHeight, 40), 200);
        userInput.style.height = `${newHeight}px`;
        adjustMessagesDivHeight();
    };

    const adjustMessagesDivHeight = () => {
        const previousScrollHeight = messagesDiv.scrollHeight;
        const totalHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        const inputHeight = Math.min(userInput.offsetHeight, 200);
        messagesDiv.style.height = `${totalHeight - inputHeight - 40}px`;

        const newScrollHeight = messagesDiv.scrollHeight;
        messagesDiv.scrollTop += newScrollHeight - previousScrollHeight;
    };

    window.addEventListener('resize', adjustMessagesDivHeight);
    userInput.addEventListener('focusout', () => {
        setTimeout(adjustMessagesDivHeight, 300);
    });
    userInput.addEventListener('blur', adjustMessagesDivHeight);
    userInput.addEventListener('focus', () => {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
    userInput.addEventListener('input', adjustTextareaHeight);

    const handleSendButtonClick = async () => {
        const prompt = userInput.value.trim();
        if (prompt) {
            await sendMessage(prompt, messagesDiv, userInput, fileInput, logoContainer, chatContainer);
        }
    };

    sendButton.addEventListener('click', handleSendButtonClick);
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSendButtonClick();
        }
    });

    // 이미지 업로드 초기화
    initImageUpload();
};

// Export the initChat function
export default initChat;
