// sendMessage.js
import hljs from 'highlight.js'; // highlight.js 가져오기

export const sendMessage = async (prompt, messagesDiv, userInput, fileInput, logoContainer, chatContainer) => {
    const formattedPrompt = escapeHTML(prompt).replace(/\n/g, '<br>');
    messagesDiv.innerHTML += `<div class="message user-message">${formattedPrompt}</div>`;
    userInput.value = '';
    userInput.style.height = 'auto';

    const formData = new FormData();
    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
        await fetch('/upload_image/', {
            method: 'POST',
            body: formData
        });
    }

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

        // 마크다운 및 코드 블록 처리
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
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // 코드 블록 하이라이팅
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

    } catch (error) {
        console.error('Error:', error);
        messagesDiv.innerHTML += `<div class="message assistant-message">An error occurred. Please try again.</div>`;
        loadingParentDiv.remove();
    }
};

const escapeHTML = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
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
