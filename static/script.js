document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const messagesDiv = document.getElementById('messages');
    const chatContainer = document.getElementById('chat-container');
    const logoContainer = document.querySelector('.logo-container');
    let isFirstMessageSent = false;

    // Detect if the device is mobile
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    // Function to adjust the height of the textarea
    const adjustTextareaHeight = () => {
        userInput.style.height = 'auto'; // Reset the height to allow shrinking if necessary
        userInput.style.height = `${userInput.scrollHeight}px`; // Set height based on scroll height
    };

    // Function to copy text to clipboard
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('Copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    // Function to create a message element with copy button
    const createMessageElement = (messageText, isUserMessage) => {
        const container = document.createElement('div');
        container.className = `message ${isUserMessage ? 'user-message' : 'assistant-message'}`;

        const content = document.createElement('div');
        content.className = 'message-content';

        const textElement = document.createElement('p');
        textElement.innerHTML = messageText; // Use innerHTML to render HTML content
        content.appendChild(textElement);

        const copyButton = document.createElement('button');
        copyButton.className = 'copy-btn';
        copyButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path></svg>`;
        copyButton.onclick = () => copyToClipboard(textElement.textContent);
        content.appendChild(copyButton);

        container.appendChild(content);
        return container;
    };

    // Function to create a codeblock element with copy button
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
    copyButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path></svg>`;
    copyButton.onclick = () => copyToClipboard(code);
    header.appendChild(copyButton);

    container.appendChild(header);

    const pre = document.createElement('pre');
    const codeElement = document.createElement('code');
    codeElement.className = `language-${language.toLowerCase()}`;
    codeElement.textContent = code; // Use textContent to avoid rendering issues
    pre.appendChild(codeElement);
    container.appendChild(pre);

    return container;
};
    
    // Function to send the message
    const sendMessage = async () => {
        const prompt = userInput.value.trim();
        if (prompt) {
            // Append user message to messagesDiv
            messagesDiv.appendChild(createMessageElement(prompt, true));
            userInput.value = ''; // Clear the input field

            try {
                // Fetch the response from the server
                const response = await fetch('/process_message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ prompt })
                });

                // Get the response as text (HTML)
                const text = await response.text();

                // Check if the response contains code
                if (text.startsWith('<pre><code')) {
                    // Append the server's response as a code block
                    messagesDiv.appendChild(createCodeBlockElement(text, 'JavaScript'));
                } else {
                    // Append the server's response as a message
                    messagesDiv.appendChild(createMessageElement(text, false));
                }

                // Apply syntax highlighting
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block); // Updated method for highlighting
                });
            } catch (error) {
                console.error('Error:', error);
                messagesDiv.appendChild(createMessageElement('An error occurred. Please try again.', false));
            }

            // Scroll to the bottom of the messagesDiv
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            // Display chat container and hide logo if it's the first message
            if (!isFirstMessageSent) {
                logoContainer.style.display = 'none';
                chatContainer.style.display = 'flex';
                messagesDiv.classList.add('expanded'); // Expand the message box
                isFirstMessageSent = true;
            }
        }
    };

    // Event listener for the send button
    sendButton.addEventListener('click', sendMessage);

    // Event listener for the Enter key in the textarea
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            if (isMobile) {
                // Mobile devices: Enter key is for line break
                event.preventDefault(); // Prevent default Enter behavior
                userInput.value += '\n'; // Add a newline
                setTimeout(adjustTextareaHeight, 100);
            } else {
                // Desktop devices: Enter key sends the message
                if (event.shiftKey) {
                    event.preventDefault(); // Prevent default Enter behavior
                    userInput.value += '\n'; // Add a newline
                    setTimeout(adjustTextareaHeight, 100);
                } else {
                    event.preventDefault(); // Prevent default Enter behavior
                    sendMessage(); // Send the message
                }
            }
        }
    });

    // Event listener for input changes to adjust textarea height
    userInput.addEventListener('input', adjustTextareaHeight);

    // Handle window resize events
    window.addEventListener('resize', () => {
        if (document.activeElement === userInput) {
            messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to bottom on resize if input is focused
        }
    });

    // Ensure messagesDiv scrolls to bottom on input focus
    userInput.addEventListener('focus', () => {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    // Initial adjustment of textarea height
    adjustTextareaHeight();
});
