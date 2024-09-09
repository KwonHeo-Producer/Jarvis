document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const messagesDiv = document.getElementById('messages');
    const mainPage = document.getElementById('main-page');

    // 메시지 전송 함수
    const sendMessage = async () => {
        console.log('sendMessage called');
        const prompt = userInput.value;
        if (prompt) {
            // 사용자 메시지 표시
            messagesDiv.innerHTML += `<div class="message user-message">${prompt}</div>`;
            userInput.value = '';

            // 서버에 요청
            try {
                const response = await fetch('/process_message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ prompt })
                });
                const data = await response.json();

                // AI 응답 표시
                if (data.response) {
                    messagesDiv.innerHTML += `<div class="message assistant-message">${data.response}</div>`;
                } else if (data.error) {
                    messagesDiv.innerHTML += `<div class="message assistant-message">${data.error}</div>`;
                }
            } catch (error) {
                console.error('Error:', error);
                messagesDiv.innerHTML += `<div class="message assistant-message">An error occurred. Please try again.</div>`;
            }

            // 스크롤 아래로 이동
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            // 첫 입력 후 메인 페이지 숨기기
            mainPage.style.display = 'none';
        }
    };

    // 전송 버튼 클릭 이벤트
    sendButton.addEventListener('click', sendMessage);

    // Enter 키를 눌렀을 때 메시지 전송
    userInput.addEventListener('keydown', (event) => {
        console.log('Key pressed:', event.key);
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // 기본 Enter 동작 방지 (줄바꿈 방지)
            sendMessage();
        }
    });
});
