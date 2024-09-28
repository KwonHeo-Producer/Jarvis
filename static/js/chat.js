// chat.js
const initChat = () => {
    const sendButton = document.getElementById('send-button'); // 전송 버튼 요소 가져오기
    const userInput = document.getElementById('user-input'); // 사용자 입력 요소 가져오기
    const messagesDiv = document.getElementById('messages'); // 메시지 표시 영역 가져오기
    const chatContainer = document.getElementById('chat-container'); // 채팅 컨테이너 가져오기
    const logoContainer = document.querySelector('.logo-container'); // 로고 컨테이너 가져오기
    let isFirstMessageSent = false; // 첫 메시지 전송 여부
    const isMobile = /Mobi|Android/i.test(navigator.userAgent); // 모바일 여부 확인

    // 메시지 전송 함수
    const sendMessage = async () => {
        const prompt = userInput.value.trim(); // 입력값 가져오기
        if (prompt) {
            const formattedPrompt = escapeHTML(prompt).replace(/\n/g, '<br>'); // HTML 이스케이프 및 줄바꿈 처리
            addUserMessage(formattedPrompt); // 사용자 메시지 추가
            userInput.value = ''; // 입력값 초기화
            userInput.style.height = 'auto'; // 텍스트 영역 높이 초기화

            const loadingParentDiv = createLoadingIndicator(); // 로딩 표시 생성
            messagesDiv.scrollTop = messagesDiv.scrollHeight; // 메시지 영역 하단으로 스크롤

            try {
                const text = await fetchResponse(prompt); // 서버 응답 가져오기
                const currentMessageDiv = createAssistantMessage(text); // 어시스턴트 메시지 생성
                messagesDiv.appendChild(currentMessageDiv); // 메시지 영역에 추가
                loadingParentDiv.remove(); // 로딩 표시 제거
                highlightCodeBlocks(); // 코드 블록 하이라이트

                if (!isFirstMessageSent) {
                    handleFirstMessageSent(); // 첫 메시지 전송 처리
                }
                adjustTextareaHeight(); // 텍스트 영역 높이 조정
            } catch (error) {
                handleError(error, loadingParentDiv); // 에러 처리
            }

            messagesDiv.scrollTop = messagesDiv.scrollHeight; // 메시지 영역 하단으로 스크롤
        }
    };

    // 메시지 관련 함수
    const addUserMessage = (formattedPrompt) => {
        messagesDiv.innerHTML += `<div class="message user-message">${formattedPrompt}</div>`; // 사용자 메시지 추가
    };

    // 로딩 표시 생성 함수
    const createLoadingIndicator = () => {
        const loadingParentDiv = document.createElement('div'); // 로딩 부모 div 생성
        loadingParentDiv.className = 'loading-parent'; // 클래스 이름 설정
        loadingParentDiv.style.height = '40px'; // 높이 설정
        messagesDiv.appendChild(loadingParentDiv); // 메시지 영역에 추가

        const loadingSpinnerDiv = document.createElement('div'); // 로딩 스피너 div 생성
        loadingSpinnerDiv.className = 'loading-spinner'; // 클래스 이름 설정
        loadingSpinnerDiv.style.height = '40px'; // 높이 설정
        loadingSpinnerDiv.style.width = '40px'; // 너비 설정
        loadingSpinnerDiv.style.display = 'flex'; // flex로 설정
        loadingParentDiv.appendChild(loadingSpinnerDiv); // 부모 div에 추가
        return loadingParentDiv; // 로딩 표시 반환
    };

    // 서버에 메시지 전송 함수
    const fetchResponse = async (prompt) => {
        const response = await fetch('/process_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt }) // 입력값을 JSON 형태로 전송
        });
        return response.text(); // 서버 응답 텍스트 반환
    };

    // 어시스턴트 메시지 생성 함수
    const createAssistantMessage = (text) => {
        const tempDiv = document.createElement('div'); // 임시 div 생성
        tempDiv.innerHTML = text; // 응답 텍스트를 HTML로 설정
        let currentMessageDiv = document.createElement('div'); // 현재 메시지 div 생성
        currentMessageDiv.className = 'message assistant-message'; // 클래스 이름 설정

        // 응답의 각 노드를 처리
        tempDiv.childNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.querySelector('pre code')) { // 코드 블록이 있는 경우
                    addCodeBlock(node, currentMessageDiv); // 코드 블록 추가
                } else {
                    currentMessageDiv.innerHTML += node.outerHTML; // 다른 노드는 HTML로 추가
                }
            }
        });

        addCopyButton(currentMessageDiv); // 복사 버튼 추가
        return currentMessageDiv; // 어시스턴트 메시지 반환
    };

    // 코드 블록 추가 함수
    const addCodeBlock = (node, currentMessageDiv) => {
        const codeBlocks = node.querySelectorAll('pre code');
        codeBlocks.forEach((block) => {
            const codeBlockDiv = document.createElement('div'); // 코드 블록 div 생성
            codeBlockDiv.className = 'code-block'; // 클래스 이름 설정
            const codeHeaderDiv = document.createElement('div'); // 코드 헤더 div 생성
            codeHeaderDiv.className = 'code-header'; // 클래스 이름 설정
            const language = block.className; // 언어 가져오기
            const codeLabelDiv = document.createElement('div'); // 코드 레이블 div 생성
            codeLabelDiv.className = 'code-label'; // 클래스 이름 설정
            codeLabelDiv.textContent = language ? `${language}` : 'Code'; // 언어 또는 'Code' 레이블 설정
            codeHeaderDiv.appendChild(codeLabelDiv); // 코드 헤더에 레이블 추가
            codeBlockDiv.appendChild(codeHeaderDiv); // 코드 블록에 헤더 추가
            const codePre = document.createElement('pre'); // pre 태그 생성
            codePre.appendChild(block.cloneNode(true)); // 코드 블록 복사하여 추가
            codeBlockDiv.appendChild(codePre); // 코드 블록에 pre 추가
            currentMessageDiv.appendChild(codeBlockDiv); // 현재 메시지 div에 코드 블록 추가
        });
    };

    // 복사 버튼 추가 함수
    const addCopyButton = (currentMessageDiv) => {
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy'; // 버튼 텍스트 설정
        copyButton.className = 'copy-button'; // 클래스 이름 설정
        copyButton.onclick = () => {
            const messageHTML = currentMessageDiv.innerHTML; 
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = messageHTML; 
            const copyableContent = Array.from(tempDiv.childNodes)
                .filter(node => node.tagName !== 'BUTTON') // 버튼 제외
                .map(node => node.innerText) // 텍스트만 가져오기
                .join('\n'); // 줄바꿈으로 연결
            copyToClipboard(copyableContent, copyButton); // 클립보드에 복사
        };
        currentMessageDiv.appendChild(copyButton); // 현재 메시지 div에 복사 버튼 추가
    };

    // 코드 블록 하이라이트 함수
    const highlightCodeBlocks = () => {
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block); // 하이라이트 처리
        });
        addCopyButtons(); // 코드 블록에 복사 버튼 추가
    };

    // 첫 메시지 전송 처리 함수
    const handleFirstMessageSent = () => {
        logoContainer.style.display = 'none'; // 로고 숨기기
        chatContainer.style.display = 'flex'; // 채팅 컨테이너 표시
        messagesDiv.classList.add('expanded'); // 메시지 영역 확장
        isFirstMessageSent = true; // 첫 메시지 전송 상태 업데이트
    };

    // 에러 처리 함수
    const handleError = (error, loadingParentDiv) => {
        console.error('Error:', error); // 에러 로그
        messagesDiv.innerHTML += `<div class="message assistant-message">An error occurred. Please try again.</div>`; // 에러 메시지 추가
        loadingParentDiv.remove(); // 로딩 표시 제거
    };

    // 클립보드에 복사하는 함수
    const copyToClipboard = (text, button) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                button.textContent = 'Copied!'; // 복사 성공 메시지 설정
                setTimeout(() => {
                    button.textContent = 'Copy'; // 원래 텍스트로 복원
                }, 2000); // 2초 후 복원
            })
            .catch(err => {
                console.error('Error copying text: ', err); // 에러 로그
            });
    };

    // 코드 블록에 복사 버튼 추가하는 함수
    const addCopyButtons = () => {
        document.querySelectorAll('.code-block').forEach((codeBlockDiv) => {
            const existingButton = codeBlockDiv.querySelector('.copy-button'); // 기존 버튼 가져오기
            if (existingButton) {
                existingButton.remove(); // 기존 버튼 제거
            }

            const copyButton = document.createElement('button'); // 복사 버튼 생성
            copyButton.textContent = 'Copy'; // 버튼 텍스트 설정
            copyButton.className = 'copy-button'; // 클래스 이름 설정
            copyButton.onclick = () => { // 클릭 시 복사 기능
                const codeText = codeBlockDiv.querySelector('code').innerText; // 코드 텍스트 가져오기
                copyToClipboard(codeText, copyButton); // 클립보드에 복사
            };
            const codeHeader = codeBlockDiv.querySelector('.code-header'); // 코드 헤더 가져오기
            if (codeHeader) {
                codeHeader.appendChild(copyButton); // 코드 헤더에 복사 버튼 추가
            } else {
                codeBlockDiv.appendChild(copyButton); // 코드 블록에 복사 버튼 추가
            }
        });
    };

    // 버튼 클릭 이벤트 리스너
    sendButton.addEventListener('click', sendMessage); // 전송 버튼 클릭 시 메시지 전송
    userInput.addEventListener('input', adjustTextareaHeight); // 입력 시 높이 조정

    adjustTextareaHeight(); // 초기 높이 조정
    adjustMessagesDivHeight(); // 초기 메시지 영역 높이 조정
};

// initChat 함수 내보내기
export default initChat;
