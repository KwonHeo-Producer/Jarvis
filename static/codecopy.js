window.addEventListener('load', function () {
    document.querySelectorAll('pre[id^="code"]').forEach(function (e) { // 모든 코드 블록에 대해 반복
        let button = document.createElement('button'); // 복사 버튼 생성
        button.className = 'copy-button'; // 클래스 지정
        button.style.cursor = 'pointer'; // 커서 스타일 지정
        button.setAttribute('data-clipboard-text', e.innerText); // 클립보드에 복사할 텍스트 지정
        button.textContent = 'Copy'; // 버튼 텍스트 설정
        button.addEventListener('mouseleave', function(event) { // 마우스가 버튼을 떠날 때 이벤트 처리
            event.currentTarget.setAttribute('class', 'copy-button'); // 'copy-message' 제거
        });
        
        e.appendChild(button); // 복사 버튼을 코드 블록에 추가
    });
 
    // ClipboardJS를 사용하여 클립보드 이벤트 처리
    var clipboard = new ClipboardJS('.copy-button');
    clipboard.on('success', function (e) {
        var button = e.trigger;
        // 복사 성공 텍스트 설정
        button.textContent = 'Copied!';
        button.setAttribute('class', 'copy-button copy-message');
 
        // 1.5초 후에 버튼을 초기 상태로 되돌림
        setTimeout(function() {
            button.setAttribute('class', 'copy-button');
            button.textContent = 'Copy'; // 초기 텍스트로 되돌림
        }, 1500);
    });
});
