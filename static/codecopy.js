window.addEventListener('load', function () {
    // 모든 <pre> 요소에 대해 반복
    document.querySelectorAll('pre').forEach(function (e) {
        // 복사 버튼 생성
        let button = document.createElement('button');
        button.innerText = "Copy";
        button.className = 'copy-button';
        button.style.cursor = 'pointer';
        button.setAttribute('data-clipboard-text', e.textContent.trim()); // textContent 사용

        // 마우스가 버튼을 떠날 때 이벤트 처리
        button.addEventListener('mouseleave', function(event) {
            event.currentTarget.classList.remove('copy-message');
            event.currentTarget.innerText = 'Copy';
        });

        // <pre> 요소에 버튼 추가
        e.style.position = 'relative'; // 버튼 위치 조정을 위한 스타일
        e.appendChild(button);
    });

    // ClipboardJS를 사용하여 클립보드 이벤트 처리
    var clipboard = new ClipboardJS('.copy-button');
    clipboard.on('success', function (e) {
        e.clearSelection();
        let button = e.trigger;

        // 성공 메시지 표시
        button.classList.add('copy-message');
        button.innerText = 'Copied!';

        // 1초 후 버튼을 초기 상태로 되돌림
        setTimeout(() => {
            button.classList.remove('copy-message');
            button.innerText = 'Copy';
        }, 1500);
    });

    // ClipboardJS 에러 처리 (선택 사항)
    clipboard.on('error', function (e) {
        console.error('ClipboardJS error:', e);
    });
});
