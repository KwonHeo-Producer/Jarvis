document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const messagesDiv = document.getElementById('messages');
    const chatContainer = document.getElementById('chat-container');
    const logoContainer = document.querySelector('.logo-container');
    let isFirstMessageSent = false;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    // Adjust the textarea height based on its content
    const adjustTextareaHeight = () => {
        userInput.style.height = 'auto';
        const newHeight = Math.max(userInput.scrollHeight, 40);
        userInput.style.height = `${newHeight}px`;
    };

    // Event listener for handling 'Enter' keypress in the textarea
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (isMobile) {
                userInput.value += '\n';
                adjustTextareaHeight();
            } else {
                if (event.shiftKey) {
                    userInput.value += '\n';
                    adjustTextareaHeight();
                } else {
                    sendMessage();
                }
            }
        }
    });

    // Function to send the message and handle response
    const sendMessage = async () => {
        const prompt = userInput.value.trim();
        if (prompt) {
            // Append user message to the messages container
            messagesDiv.innerHTML += `<div class="message user-message">${prompt}</div>`;
            userInput.value = '';
            userInput.style.height = 'auto';

            try {
                const response = await fetch('/process_message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ prompt })
                });
                const text = await response.text();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = text;
                const fragment = document.createDocumentFragment();
                let currentMessageDiv = document.createElement('div');
                currentMessageDiv.className = 'message assistant-message';

                tempDiv.childNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.querySelector('pre code')) {
                            const codeBlocks = node.querySelectorAll('pre code');
                            codeBlocks.forEach((block) => {
                                const codeBlockDiv = document.createElement('div');
                                codeBlockDiv.className = 'code-block';

                                // Create Copy button
                                const copyButton = document.createElement('button');
                                copyButton.textContent = 'Copy';
                                copyButton.className = 'copy-button';

                                // Copy to clipboard functionality
                                copyButton.onclick = () => {
                                    const codeText = block.innerText;
                                    copyToClipboard(codeText);
                                };
                                codeBlockDiv.appendChild(copyButton);

                                const codePre = document.createElement('pre');
                                codePre.appendChild(block.cloneNode(true));
                                codeBlockDiv.appendChild(codePre);
                                currentMessageDiv.appendChild(codeBlockDiv);
                            });
                        } else {
                            currentMessageDiv.innerHTML += node.outerHTML;
                        }
                    }
                });

                messagesDiv.appendChild(currentMessageDiv);
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightBlock(block);
                });
            } catch (error) {
                console.error('Error:', error);
                messagesDiv.innerHTML += `<div class="message assistant-message">An error occurred. Please try again.</div>`;
            }
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            if (!isFirstMessageSent) {
                logoContainer.style.display = 'none';
                chatContainer.style.display = 'flex';
                messagesDiv.classList.add('expanded');
                isFirstMessageSent = true;
            }
            adjustTextareaHeight();
        }
    };

    // Function to copy text to clipboard using execCommand
    const copyToClipboard = (text) => {
        // Create a temporary textarea element
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            // Execute copy command
            const successful = document.execCommand('copy');
            if (successful) {
                alert('Code copied to clipboard!');
            } else {
                console.error('Failed to copy text.');
            }
        } catch (err) {
            console.error('Error copying text: ', err);
        } finally {
            // Clean up
            document.body.removeChild(textarea);
        }
    };

    // Event listeners for sending messages and adjusting textarea
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('input', adjustTextareaHeight);
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
