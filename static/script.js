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

    // Function to convert newlines to <br> tags
    const convertNewlinesToHTML = (text) => {
        return text.replace(/\n/g, '<br>');
    };

    // Function to copy message content
    const copyMessage = (button) => {
        const messageContent = button.closest('.message-content');
        const text = messageContent.querySelector('p').textContent;

        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = text;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);

        button.textContent = 'Copied!';
        setTimeout(() => button.textContent = 'Copy', 2000);
    };

    // Function to copy code content
    const copyCode = (button) => {
        const codeBlock = button.closest('.code-block');
        const codeElement = codeBlock.querySelector('pre code');

        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = codeElement.textContent;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);

        button.textContent = 'Copied!';
        setTimeout(() => button.textContent = 'Copy', 2000);
    };

    // Function to send the message
    const sendMessage = async () => {
        const prompt = userInput.value.trim();
        if (prompt) {
            const formattedMessage = convertNewlinesToHTML(prompt);

            // Append user message to messagesDiv
            messagesDiv.innerHTML += `
                <div class="message user-message">
                    <div class="message-content">
                        <p>${formattedMessage}</p>
                        <button class="copy-btn" onclick="copyMessage(this)">Copy</button>
                    </div>
                </div>`;
            userInput.value = '';

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

                // Append the server's response to messagesDiv
                messagesDiv.innerHTML += `
                    <div class="message assistant-message">
                        <div class="code-block">
                            <div class="code-header">
                                <span class="language">JavaScript</span>
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                            </div>
                            <pre><code class="language-javascript">${text}</code></pre>
                        </div>
                    </div>`;

                // Apply syntax highlighting
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightBlock(block);
                });
            } catch (error) {
                console.error('Error:', error);
                messagesDiv.innerHTML += `
                    <div class="message assistant-message">
                        <div class="code-block">
                            <div class="code-header">
                                <span class="language">Error</span>
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                            </div>
                            <pre><code class="language-text">An error occurred. Please try again.</code></pre>
                        </div>
                    </div>`;
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
                event.preventDefault(); // Prevent default Enter behavior
                userInput.value += '\n'; // Add a newline
                setTimeout(adjustTextareaHeight, 100); // Delay adjustment to avoid issues
            } else {
                if (event.shiftKey) {
                    event.preventDefault(); // Prevent default Enter behavior
                    userInput.value += '\n'; // Add a newline
                    setTimeout(adjustTextareaHeight, 100); // Delay adjustment to avoid issues
                } else {
                    event.preventDefault(); // Prevent default Enter behavior
                    sendMessage(); // Send the message
                }
            }
        }
    });

    // Event listener for input changes to adjust textarea height
    userInput.addEventListener('input', () => {
        setTimeout(adjustTextareaHeight, 100); // Delay adjustment to avoid issues
    });

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
