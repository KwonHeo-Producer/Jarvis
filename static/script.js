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

    userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (isMobile) {
            userInput.value += '\n';
            adjustTextareaHeight();
        } else {
            if (event.shiftKey) {
                const { selectionStart, selectionEnd, value } = userInput;
                // 텍스트와 텍스트 사이에서 줄바꿈 추가
                userInput.value = value.substring(0, selectionStart) + '\n' + value.substring(selectionStart);
                userInput.selectionStart = userInput.selectionEnd = selectionStart + 1; // 커서 위치를 줄바꿈 뒤로 이동
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

    // Function to send the message and handle response
    const sendMessage = async () => {
        const prompt = userInput.value.trim();
        if (prompt) {
            const formattedPrompt = escapeHTML(prompt).replace(/\n/g, '<br>');
            messagesDiv.innerHTML += `<div class="message user-message">${formattedPrompt}</div>`;
            userInput.value = '';
            userInput.style.height = 'auto';

            // Create a parent div for the loading spinner
            const loadingParentDiv = document.createElement('div');
            loadingParentDiv.className = 'loading-parent';
            loadingParentDiv.style.height = '40px'; // Set height to provide space
            messagesDiv.appendChild(loadingParentDiv);

            // Create the loading spinner
            const loadingSpinnerDiv = document.createElement('div');
            loadingSpinnerDiv.className = 'loading-spinner';
            loadingSpinnerDiv.style.height = '40px'; // Height of spinner
            loadingSpinnerDiv.style.width = '40px'; // Width of spinner
            loadingSpinnerDiv.style.display = 'flex'; // Use flexbox
            loadingParentDiv.appendChild(loadingSpinnerDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

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
                                const codeHeaderDiv = document.createElement('div');
                                codeHeaderDiv.className = 'code-header';
                                const language = block.className;
                                const codeLabelDiv = document.createElement('div');
                                codeLabelDiv.className = 'code-label';
                                codeLabelDiv.textContent = language ? `${language}` : 'Code';
                                codeHeaderDiv.appendChild(codeLabelDiv);
                                codeBlockDiv.appendChild(codeHeaderDiv);
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

                // Append the copy button for the assistant message
                const copyButton = document.createElement('button');
                copyButton.textContent = 'Copy';
                copyButton.className = 'copy-button';
                copyButton.onclick = () => {
                // 버튼을 제외한 메시지 내용을 복사
                const messageText = Array.from(currentMessageDiv.childNodes)
                    .filter(node => node.tagName !== 'BUTTON') // 버튼 제외
                    .map(node => {
                        if (node.querySelector('code')) {
                            // 코드 블록의 내용 가져오기
                            return node.querySelector('code').innerText;
                        }
                        return node.innerText; // 일반 메시지 텍스트
                    })
                    .join('\n'); // 줄바꿈으로 구분
                copyToClipboard(messageText);
                };
                currentMessageDiv.appendChild(copyButton);

                messagesDiv.appendChild(currentMessageDiv);
                loadingParentDiv.remove(); // Remove parent div along with the spinner

                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });

                addCopyButtons();

            } catch (error) {
                console.error('Error:', error);
                messagesDiv.innerHTML += `<div class="message assistant-message">An error occurred. Please try again.</div>`;
                loadingParentDiv.remove(); // Remove parent div on error
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
                console.log('Text successfully copied');
                alert('Text copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    };

    // Function to add copy buttons to all code blocks
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
