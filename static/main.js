// main.js

// Load chat.js
document.addEventListener('DOMContentLoaded', () => {
    const script = document.createElement('script');
    script.src = '/static/js/chat.js';
    script.onload = () => {
        // chat.js 로드 후 실행할 코드
    };
    document.body.appendChild(script);
});
