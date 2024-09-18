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
        const newHeight = Math.max(userInput.scrollHeight, 40);
        userInput.style.height = `${newHeight}px`;
    };

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

    // Function to escape HTML
    const escapeHTML = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };
    
    const sendMessage = async () => {
        const prompt = userInput.value.trim();
        if (prompt) {
            const formattedPrompt = escapeHTML(prompt).replace(/\n/g, '<br>');
            messagesDiv.innerHTML += `<div class="message user-message">${formattedPrompt}</div>`;
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
                outputMessageGradually(text);
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

    const outputMessageGradually = (text) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        let currentMessageDiv = document.createElement('div');
        currentMessageDiv.className = 'message assistant-message';

        let index = 0;
        const delay = 50; // 50ms delay between each character

        const interval = setInterval(() => {
            if (index < tempDiv.childNodes.length) {
                const node = tempDiv.childNodes[index];
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.querySelector('pre code')) {
                        const codeBlocks = node.querySelectorAll('pre code');
                        codeBlocks.forEach((block) => {
                            const codeBlockDiv = document.createElement('div');
                            codeBlockDiv.className = 'code-block';

                            // Create code-header div
                            const codeHeaderDiv = document.createElement('div');
                            codeHeaderDiv.className = 'code-header';

                            // Create and add the label
                            const language = block.className; // Extract the language from the code class
                            const codeLabelDiv = document.createElement('div');
                            codeLabelDiv.className = 'code-label';
                            codeLabelDiv.textContent = language ? `${language}` : 'Code'; // Display language or 'Code'
                            codeHeaderDiv.appendChild(codeLabelDiv);

                            // Add code-header to code-block
                            codeBlockDiv.appendChild(codeHeaderDiv);

                            // Add pre element to code-block
                            const codePre = document.createElement('pre');
                            codePre.appendChild(block.cloneNode(true));
                            codeBlockDiv.appendChild(codePre);

                            // Add code-block to current message
                            currentMessageDiv.appendChild(codeBlockDiv);
                        });
                    } else {
                        currentMessageDiv.appendChild(node.cloneNode(true));
                    }
                }
                index++;
            } else {
                clearInterval(interval);
                messagesDiv.appendChild(currentMessageDiv);
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
                addCopyButtons();
            }
        }, delay);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('Text successfully copied');
                alert('Code copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    };

    const addCopyButtons = () => {
        document.querySelectorAll('.code-block').forEach((codeBlockDiv) => {
            const existingButton = codeBlockDiv.querySelector('.copy-button');
            if (existingButton) {
                existingButton.remove();
            }

            const copyButton = document.createElement('button');
            copyButton.textContent = 'Copy';
            copyButton.className = 'copy-button';

            copyButton.onclick = () => {
                const codeText = codeBlockDiv.querySelector('code').innerText;
                copyToClipboard(codeText);
            };
            const codeHeader = codeBlockDiv.querySelector('.code-header');
            if (codeHeader) {
                codeHeader.appendChild(copyButton);
            } else {
                codeBlockDiv.appendChild(copyButton);
            }
        });
    };

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
