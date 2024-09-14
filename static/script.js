document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const messagesDiv = document.getElementById('messages');
    const chatContainer = document.getElementById('chat-container');
    const logoContainer = document.querySelector('.logo-container');
    let sessionId = null;

    // 세션을 생성하거나 기존 세션을 유지하는 함수
    async function initializeSession() {
        // 세션 ID가 없는 경우, 새로운 세션 ID를 생성
        if (!sessionId) {
            sessionId = uuidv4(); // 세션 ID를 생성
        }
    }

    // 메시지 전송 함수
    const sendMessage = async () => {
        const prompt = userInput.value.trim();
        if (prompt) {
            // 사용자 메시지를 messagesDiv에 추가
            messagesDiv.innerHTML += `<div class="message user-message">${prompt}</div>`;
            userInput.value = '';

            try {
                const response = await fetch('/process_message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ prompt, session_id: sessionId })
                });
                const data = await response.json();

                if (data.response) {
                    messagesDiv.innerHTML += `<div class="message assistant-message">${data.response}</div>`;
                } else if (data.error) {
                    messagesDiv.innerHTML += `<div class="message assistant-message">${data.error}</div>`;
                }
            } catch (error) {
                console.error('Error:', error);
                messagesDiv.innerHTML += `<div class="message assistant-message">An error occurred. Please try again.</div>`;
            }

            // 메시지 영역 스크롤을 가장 아래로
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            // 첫 번째 메시지가 전송된 경우, 로고를 숨기고 채팅 컨테이너를 표시
            if (sessionId) {
                logoContainer.style.display = 'none';
                chatContainer.style.display = 'flex';
                messagesDiv.classList.add('expanded'); // 메시지 박스 크기 변경
            }
        }
    };

    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            if (event.shiftKey) {
                // Shift + Enter는 줄바꿈
                event.preventDefault();
                userInput.value += '\n';
                adjustTextareaHeight();
            } else {
                // Enter만 눌렀을 때 메시지 전송
                event.preventDefault();
                sendMessage();
            }
        }
    });

    // 입력 필드 크기 조정 함수
    function adjustTextareaHeight() {
        userInput.style.height = 'auto'; // Reset height
        userInput.style.height = `${userInput.scrollHeight}px`; // Set new height
    }

    // 페이지를 떠나거나 새로 고침할 때 서버에 세션 종료 요청 보내기
    window.addEventListener('beforeunload', async () => {
        if (sessionId) {
            try {
                await fetch('/end_session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ session_id: sessionId })
                });
            } catch (error) {
                console.error('Error:', error);
            }
        }
    });

    // 페이지 로드 시 세션 초기화
    initializeSession();

    // Handle window resize events
    window.addEventListener('resize', () => {
        if (document.activeElement === userInput) {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    });

    // Ensure that messagesDiv scrolls to bottom on input focus
    userInput.addEventListener('focus', () => {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
    
    // 입력창의 내용을 수정할 때마다 높이 조정
    userInput.addEventListener('input', adjustTextareaHeight);

    // Function to generate a UUID
    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
});
