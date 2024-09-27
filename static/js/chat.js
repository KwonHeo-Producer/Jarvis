// chat.js
const initChat = () => {
    // DOM 요소 선택
    const domElements = {
        sendButton: document.getElementById('send-button'),
        userInput: document.getElementById('user-input'),
        messagesDiv: document.getElementById('messages'),
        chatContainer: document.getElementById('chat-container'),
        logoContainer: document.querySelector('.logo-container'),
    };

    // ChatManager 인스턴스 생성 및 초기화
    const chatManager = new ChatManager(domElements);
    chatManager.initialize();
};

// ChatManager 클래스 정의
class ChatManager {
    constructor({ sendButton, userInput, messagesDiv, chatContainer, logoContainer }) {
        // DOM 요소 저장
        this.sendButton = sendButton;
        this.userInput = userInput;
        this.messagesDiv = messagesDiv;
        this.chatContainer = chatContainer;
        this.logoContainer = logoContainer;
        this.isFirstMessageSent = false; // 첫 메시지 전송 여부
        this.isMobile = /Mobi|Android/i.test(navigator.userAgent); // 모바일 여부 확인
    }

    // 초기화 메서드
    initialize() {
        this.bindEvents(); // 이벤트 바인딩
        this.adjustTextareaHeight(); // 텍스트 영역 초기 높이 조정
        this.adjustMessagesDivHeight(); // 메시지 영역 초기 높이 조정
    }

    // 이벤트 바인딩 메서드
    bindEvents() {
        this.sendButton.addEventListener('click', () => this.sendMessage()); // 전송 버튼 클릭 시 메시지 전송
        this.userInput.addEventListener('input', () => this.adjustTextareaHeight()); // 입력창 내용 변화에 따른 높이 조정
        window.addEventListener('resize', () => this.adjustMessagesDivHeight()); // 윈도우 크기 조정 시 메시지 영역 높이 조정
        this.userInput.addEventListener('focusout', () => setTimeout(() => this.adjustMessagesDivHeight(), 300)); // 포커스 아웃 시 높이 조정
        this.userInput.addEventListener('blur', () => this.adjustMessagesDivHeight()); // 블러 이벤트
        this.userInput.addEventListener('focus', () => {
            this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight; // 포커스 시 메시지 영역 스크롤
        });
        this.userInput.addEventListener('keydown', (event) => this.handleKeyDown(event)); // 키보드 이벤트 처리
    }

    // 키다운 이벤트 처리 메서드
    handleKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // 기본 Enter 동작 방지
            if (this.isMobile) {
                // 모바일에서는 줄바꿈 추가
                this.userInput.value += '\n';
                this.adjustTextareaHeight(); // 높이 조정
            } else {
                if (event.shiftKey) {
                    this.handleShiftEnter(); // Shift + Enter 처리
                } else {
                    this.sendMessage(); // 메시지 전송
                }
            }
        }
    }

    // Shift + Enter 처리 메서드
    handleShiftEnter() {
        const { selectionStart, selectionEnd, value } = this.userInput;
        // 현재 커서 위치에 줄바꿈 추가
        this.userInput.value = value.substring(0, selectionStart) + '\n' + value.substring(selectionEnd);
        this.userInput.selectionStart = this.userInput.selectionEnd = selectionStart + 1; // 커서 위치 조정
        this.adjustTextareaHeight(); // 높이 조정
    }

    // 메시지 전송 메서드
    async sendMessage() {
        const prompt = this.userInput.value.trim(); // 입력된 메시지
        if (prompt) {
            this.appendUserMessage(prompt); // 사용자 메시지 추가
            this.showLoadingSpinner(); // 로딩 스피너 표시

            try {
                const responseText = await this.fetchResponse(prompt); // 서버에 메시지 전송 및 응답 받기
                this.appendAssistantMessage(responseText); // 보조 메시지 추가
                this.removeLoadingSpinner(); // 로딩 스피너 제거
                this.updateUIAfterFirstMessage(); // 첫 메시지 전송 후 UI 업데이트
            } catch (error) {
                console.error('Error:', error); // 에러 로그
                this.appendErrorMessage(); // 에러 메시지 표시
                this.removeLoadingSpinner(); // 로딩 스피너 제거
            }

            this.scrollToBottom(); // 스크롤 아래로 이동
            this.adjustTextareaHeight(); // 텍스트 영역 높이 조정
        }
    }

    // 사용자 메시지 추가 메서드
    appendUserMessage(prompt) {
        const formattedPrompt = this.escapeHTML(prompt).replace(/\n/g, '<br>'); // HTML 이스케이프 및 줄바꿈 처리
        this.messagesDiv.innerHTML += `<div class="message user-message">${formattedPrompt}</div>`; // 메시지 표시
        this.userInput.value = ''; // 입력창 초기화
        this.userInput.style.height = 'auto'; // 높이 초기화
    }

    // 로딩 스피너 표시 메서드
    showLoadingSpinner() {
        const loadingParentDiv = document.createElement('div');
        loadingParentDiv.className = 'loading-parent';
        loadingParentDiv.style.height = '40px';
        this.messagesDiv.appendChild(loadingParentDiv); // 로딩 부모 div 추가

        const loadingSpinnerDiv = document.createElement('div');
        loadingSpinnerDiv.className = 'loading-spinner';
        loadingSpinnerDiv.style.height = '40px';
        loadingSpinnerDiv.style.width = '40px';
        loadingSpinnerDiv.style.display = 'flex';
        loadingParentDiv.appendChild(loadingSpinnerDiv); // 로딩 스피너 추가
        this.scrollToBottom(); // 스크롤 아래로 이동
    }

    // 서버에 메시지 전송 및 응답 받는 메서드
    async fetchResponse(prompt) {
        const response = await fetch('/process_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        });
        return await response.text(); // 응답 텍스트 반환
    }

    // 보조 메시지 추가 메서드
    appendAssistantMessage(responseText) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = responseText; // 응답 HTML 설정
        let currentMessageDiv = document.createElement('div');
        currentMessageDiv.className = 'message assistant-message'; // 보조 메시지 div 생성

        tempDiv.childNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.querySelector('pre code')) {
                    this.appendCodeBlock(node, currentMessageDiv); // 코드 블록 처리
                } else {
                    currentMessageDiv.innerHTML += node.outerHTML; // 일반 메시지 추가
                }
            }
        });

        this.addCopyButton(currentMessageDiv); // 복사 버튼 추가
        this.messagesDiv.appendChild(currentMessageDiv); // 메시지 영역에 추가
        this.highlightCodeBlocks(); // 코드 하이라이트
    }

    // 코드 블록 처리 메서드
    appendCodeBlock(node, currentMessageDiv) {
        const codeBlocks = node.querySelectorAll('pre code');
        codeBlocks.forEach((block) => {
            const codeBlockDiv = document.createElement('div');
            codeBlockDiv.className = 'code-block';
            const codeHeaderDiv = document.createElement('div');
            codeHeaderDiv.className = 'code-header';
            const language = block.className; // 코드 언어
            const codeLabelDiv = document.createElement('div');
            codeLabelDiv.className = 'code-label';
            codeLabelDiv.textContent = language ? `${language}` : 'Code'; // 코드 라벨
            codeHeaderDiv.appendChild(codeLabelDiv); // 코드 헤더에 라벨 추가
            codeBlockDiv.appendChild(codeHeaderDiv); // 코드 블록에 헤더 추가
            const codePre = document.createElement('pre');
            codePre.appendChild(block.cloneNode(true)); // 코드 블록 추가
            codeBlockDiv.appendChild(codePre); // 전체 코드 블록 추가
            currentMessageDiv.appendChild(codeBlockDiv); // 현재 메시지에 추가
        });
    }

    // 복사 버튼 추가 메서드
    addCopyButton(currentMessageDiv) {
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy'; // 버튼 텍스트 설정
        copyButton.className = 'copy-button';
        copyButton.onclick = () => {
            const messageHTML = currentMessageDiv.innerHTML; // 복사할 메시지 HTML
            const copyableContent = this.extractCopyableContent(messageHTML); // 복사할 내용 추출
            this.copyToClipboard(copyableContent, copyButton); // 클립보드 복사
        };
        currentMessageDiv.appendChild(copyButton); // 복사 버튼 추가
    }

    // 복사 가능한 텍스트 추출 메서드
    extractCopyableContent(messageHTML) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = messageHTML; // 임시 div에 HTML 설정
        return Array.from(tempDiv.childNodes)
            .filter(node => node.tagName !== 'BUTTON') // 버튼 제외
            .map(node => node.innerText) // 텍스트 추출
            .join('\n'); // 줄바꿈으로 연결
    }

    // 클립보드 복사 메서드
    copyToClipboard(text, button) {
        navigator.clipboard.writeText(text) // 클립보드에 텍스트 복사
            .then(() => {
                button.textContent = 'Copied!'; // 버튼 텍스트 변경
                setTimeout(() => {
                    button.textContent = 'Copy'; // 일정 시간 후 원래 텍스트로 변경
                }, 1000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err); // 에러 로그
            });
    }

    // 코드 하이라이트 처리 메서드
    highlightCodeBlocks() {
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block); // 하이라이트.js를 사용한 하이라이트 처리
        });
    }

    // 에러 메시지 추가 메서드
    appendErrorMessage() {
        this.messagesDiv.innerHTML += `<div class="message assistant-message">An error occurred. Please try again.</div>`; // 에러 메시지 표시
    }

    // 로딩 스피너 제거 메서드
    removeLoadingSpinner() {
        const loadingSpinner = this.messagesDiv.querySelector('.loading-parent');
        if (loadingSpinner) loadingSpinner.remove(); // 로딩 스피너 제거
    }

    // UI 업데이트 메서드
    updateUIAfterFirstMessage() {
        if (!this.isFirstMessageSent) {
            this.logoContainer.style.display = 'none'; // 로고 숨기기
            this.chatContainer.style.display = 'flex'; // 채팅 컨테이너 표시
            this.messagesDiv.classList.add('expanded'); // 메시지 영역 확장
            this.isFirstMessageSent = true; // 첫 메시지 전송 플래그 설정
        }
    }

    // 스크롤을 가장 아래로 이동하는 메서드
    scrollToBottom() {
        this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight; // 스크롤 아래로 이동
    }

    // 텍스트 영역 높이 조정 메서드
    adjustTextareaHeight() {
        this.userInput.style.height = 'auto'; // 초기화
        const newHeight = Math.min(Math.max(this.userInput.scrollHeight, 40), 200); // 최대 및 최소 높이 제한
        this.userInput.style.height = `${newHeight}px`; // 높이 설정
        this.adjustMessagesDivHeight(); // 메시지 영역 높이 조정 호출
    }

    // 메시지 영역 높이 조정 메서드
    adjustMessagesDivHeight() {
        const previousScrollHeight = this.messagesDiv.scrollHeight; // 이전 스크롤 높이 저장
        const totalHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight; // 전체 높이 계산
        const inputHeight = Math.min(this.userInput.offsetHeight, 200); // 입력창 높이
        this.messagesDiv.style.height = `${totalHeight - inputHeight - 40}px`; // 메시지 영역 높이 설정

        const newScrollHeight = this.messagesDiv.scrollHeight; // 새 스크롤 높이
        this.messagesDiv.scrollTop += newScrollHeight - previousScrollHeight; // 스크롤 조정
    }

}

// Export the initChat function
export default initChat;
