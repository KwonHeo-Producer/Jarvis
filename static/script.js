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
        const newHeight = Math.min(Math.max(userInput.scrollHeight, 40), 200);
        userInput.style.height = `${newHeight}px`;
        adjustMessagesDivHeight();
    };

    const adjustMessagesDivHeight = () => {
    const previousScrollHeight = messagesDiv.scrollHeight;
    const totalHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight; // 뷰포트 높이 가져오기
    const inputHeight = Math.min(userInput.offsetHeight, 200); // 입력창의 최대 높이 200px 적용
    messagesDiv.style.height = `${totalHeight - inputHeight - 40}px`; // 여백을 고려하여 40px 추가

    const newScrollHeight = messagesDiv.scrollHeight;
    messagesDiv.scrollTop += newScrollHeight - previousScrollHeight; // 추가된 만큼 스크롤 조정
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
                    userInput.value = value.substring(0, selectionStart) + '\n' + value.substring(selectionEnd);
                    userInput.selectionStart = userInput.selectionEnd = selectionStart + 1;
                    adjustTextareaHeight();
                } else {
                    sendMessage();
                }
            }
        }
    });

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

            const loadingParentDiv = document.createElement('div');
            loadingParentDiv.className = 'loading-parent';
            loadingParentDiv.style.height = '40px';
            messagesDiv.appendChild(loadingParentDiv);

            const loadingSpinnerDiv = document.createElement('div');
            loadingSpinnerDiv.className = 'loading-spinner';
            loadingSpinnerDiv.style.height = '40px';
            loadingSpinnerDiv.style.width = '40px';
            loadingSpinnerDiv.style.display = 'flex';
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

                const copyButton = document.createElement('button');
                copyButton.textContent = 'Copy';
                copyButton.className = 'copy-button';
                copyButton.onclick = () => {
                    const messageHTML = currentMessageDiv.innerHTML; 
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = messageHTML; 

                    const copyableContent = Array.from(tempDiv.childNodes)
                        .filter(node => node.tagName !== 'BUTTON')
                        .map(node => node.innerText)
                        .join('\n');

                    copyToClipboard(copyableContent, copyButton);
                };
                currentMessageDiv.appendChild(copyButton);

                messagesDiv.appendChild(currentMessageDiv);
                loadingParentDiv.remove();

                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });

                addCopyButtons();

            } catch (error) {
                console.error('Error:', error);
                messagesDiv.innerHTML += `<div class="message assistant-message">An error occurred. Please try again.</div>`;
                loadingParentDiv.remove();
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

    const copyToClipboard = (text, button) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('Text successfully copied');
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 1000);
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
                copyToClipboard(codeText, copyButton);
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
    window.addEventListener('resize', adjustMessagesDivHeight);
    userInput.addEventListener('focus', () => {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    adjustTextareaHeight();
    adjustMessagesDivHeight(); // 초기 높이 조정
});
