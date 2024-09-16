document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const messagesDiv = document.getElementById('messages');
    const chatContainer = document.getElementById('chat-container');
    const logoContainer = document.querySelector('.logo-container');

    let isFirstMessageSent = false;

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    const adjustTextareaHeight = () => {
        userInput.style.height = 'auto';
        userInput.style.height = `${userInput.scrollHeight}px`;
    };

    const convertNewlinesToHTML = (text) => {
        return text.replace(/\n/g, '<br>');
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('Copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const createMessageElement = (messageText, isUserMessage) => {
    const container = document.createElement('div');
    container.className = `message ${isUserMessage ? 'user-message' : 'assistant-message'}`;

    const content = document.createElement('div');
    content.className = 'message-content';

    const textElement = document.createElement('p');
    textElement.innerHTML = convertNewlinesToHTML(messageText);
    content.appendChild(textElement);

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-btn';
    copyButton.textContent = 'Copy';
    copyButton.onclick = () => copyToClipboard(textElement.textContent);
    content.appendChild(copyButton);

    container.appendChild(content);
    return container;
};

const createCodeBlockElement = (code, language) => {
    const container = document.createElement('div');
    container.className = 'code-block';

    const header = document.createElement('div');
    header.className = 'code-header';

    const languageLabel = document.createElement('span');
    languageLabel.className = 'language-label';
    languageLabel.textContent = language;
    header.appendChild(languageLabel);

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-btn';
    copyButton.textContent = 'Copy';
    copyButton.onclick = () => copyToClipboard(code);
    header.appendChild(copyButton);

    container.appendChild(header);

    const pre = document.createElement('pre');
    const codeElement = document.createElement('code');
    codeElement.className = `language-${language.toLowerCase()}`;
    codeElement.textContent = code;
    pre.appendChild(codeElement);
    container.appendChild(pre);

    return container;
};

    const sendMessage = async () => {
        const prompt = userInput.value.trim();
        if (prompt) {
            const userMessageElement = createMessageElement(prompt, true);
            messagesDiv.appendChild(userMessageElement);
            userInput.value = '';

            try {
                const response = await fetch('/process_message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ prompt })
                });

                const text = await response.text();
                const assistantMessageElement = createCodeBlockElement(text, 'JavaScript');
                messagesDiv.appendChild(assistantMessageElement);

                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightBlock(block);
                });
            } catch (error) {
                console.error('Error:', error);
                const errorMessageElement = createCodeBlockElement('An error occurred. Please try again.', 'Error');
                messagesDiv.appendChild(errorMessageElement);
            }

            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            if (!isFirstMessageSent) {
                logoContainer.style.display = 'none';
                chatContainer.style.display = 'flex';
                messagesDiv.classList.add('expanded');
                isFirstMessageSent = true;
            }
        }
    };

    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            if (isMobile) {
                event.preventDefault();
                userInput.value += '\n';
                setTimeout(adjustTextareaHeight, 100);
            } else {
                if (event.shiftKey) {
                    event.preventDefault();
                    userInput.value += '\n';
                    setTimeout(adjustTextareaHeight, 100);
                } else {
                    event.preventDefault();
                    sendMessage();
                }
            }
        }
    });

    userInput.addEventListener('input', () => {
        setTimeout(adjustTextareaHeight, 100);
    });

    window.addEventListener('resize', () => {
        if (document.activeElement === userInput) {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    });

    userInput.addEventListener('focus', () => {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    adjustTextareaHeight();
});
