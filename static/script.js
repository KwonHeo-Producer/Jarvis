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
            // 줄바꿈을 <br>로 변환
            const formattedPrompt = prompt.replace(/\n/g, '<br>');
            
            // Append user message to the messages container
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
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = text;
                let currentMessageDiv = document.createElement('div');
                currentMessageDiv.className = 'message assistant-message';

                tempDiv.childNodes.forEach(node => {
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
                            currentMessageDiv.innerHTML += node.outerHTML;
                        }
                    }
                });

                messagesDiv.appendChild(currentMessageDiv);

                // Highlight code blocks
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block); // 최신 highlight.js 메서드
                });

                // Add copy buttons after code blocks are added
                addCopyButtons();

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

    // Function to copy text to clipboard using navigator.clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('Text successfully copied'); // 디버깅용 로그 추가
                alert('Code copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    };

    // Function to add copy buttons to all code blocks
    const addCopyButtons = () => {
        document.querySelectorAll('.code-block').forEach((codeBlockDiv) => {
            // Remove any existing copy buttons to avoid duplicates
            const existingButton = codeBlockDiv.querySelector('.copy-button');
            if (existingButton) {
                existingButton.remove();
            }

            // Create Copy button
            const copyButton = document.createElement('button');
            copyButton.textContent = 'Copy';
            copyButton.className = 'copy-button';

            // Copy to clipboard functionality
            copyButton.onclick = () => {
                const codeText = codeBlockDiv.querySelector('code').innerText;
                copyToClipboard(codeText);
            };
            const codeHeader = codeBlockDiv.querySelector('.code-header');
            if (codeHeader) {
                codeHeader.appendChild(copyButton);
            } else {
                // If no code-header, append button directly to code-block
                codeBlockDiv.appendChild(copyButton);
            }
        });
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

    // Initial adjustment of textarea height
    adjustTextareaHeight();
});
