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

    const sendMessage = async () => {
        const prompt = userInput.value.trim();
        if (prompt) {
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
                                const languageClass = block.className;
                                const language = languageClass ? languageClass.replace('language-', '') : 'unknown';
                                
                                const codeBlockDiv = document.createElement('div');
                                codeBlockDiv.className = 'code-block';

                                // Create Copy button
                                const copyButton = document.createElement('button');
                                copyButton.textContent = 'Copy';
                                copyButton.className = 'copy-button';
                                
                                // Copy to clipboard functionality
                                copyButton.onclick = () => {
                                    navigator.clipboard.writeText(block.textContent).then(() => {
                                        alert('Code copied to clipboard!');
                                    }).catch(err => {
                                        console.error('Could not copy text: ', err);
                                    });
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
