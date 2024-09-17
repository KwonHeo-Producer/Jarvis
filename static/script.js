/* 기본 스타일 설정 */
body {
    font-family: Arial, sans-serif;
    background-color: #222;
    color: #BBBBBB;
    margin: 0;
    padding: 0;
    overflow-x: hidden; /* 수평 스크롤 방지 */
}
#main-page {
    position: relative;
    min-height: 100vh; /* 최소 높이 설정 */
    display: flex;
    flex-direction: column; /* 페이지의 콘텐츠가 세로로 나열되도록 설정 */
}
/* 로고 및 제목 스타일 */
.logo-container {
    text-align: center;
    margin-top: 20px;
}
.logo-image {
    width: 200px; /* 원하는 너비로 조절 */
    height: auto; /* 비율을 유지하며 높이 자동 조절 */
}
.logo-container h1 {
    color: #d2d2d2;
    margin: 10px 0; /* 위쪽과 아래쪽 여백을 동일하게 설정 */
}
/* 채팅 컨테이너 스타일 */
#chat-container {
    flex: 1; /* 채팅 컨테이너가 남은 공간을 모두 차지하도록 설정 */
    width: 80%;
    max-width: 800px; /* 최대 너비 설정 */
    margin: 20px auto;
    display: flex;
    flex-direction: column;
    gap: 10px; /* 요소들 사이의 간격 설정 */
}
/* 초기 메시지 박스 크기 */
#messages {
    /* padding: 10px; */
    height: 400px; /* 처음 화면에서의 기본 높이 */
    overflow-y: auto;
    background-color: #222; /* 메시지 영역의 배경색 추가 */
    border-radius: 8px; /* 테두리 둥글게 하기 */
    color: #FFF; /* 메시지 텍스트 색상 */
    display: flex;
    flex-direction: column;
    gap: 5px; /* 메시지 간의 간격 */
    transition: height 0.3s; /* 높이 변경 시 부드러운 전환 */
}
/* 메시지 박스 크기가 변경된 상태 */
#messages.expanded {
    height: calc(100vh - 120px); /* 입력 후 두 번째 화면에서의 높이 */
}
/* 입력 필드와 버튼을 페이지 하단에 고정시키는 스타일 */
#input-container {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%); /* 가로 중앙 정렬 */
    width: 800px; /* 입력 필드와 버튼이 페이지의 전체 너비를 차지하도록 설정 */
    background-color: #222; /* 배경색 설정 (필요에 따라 조정) */
    padding: 10px; /* 여백 설정 (필요에 따라 조정) */
    display: flex;
    align-items: center; /* 입력 필드와 버튼을 수직 중앙에 맞춤 */
    gap: 10px; /* 요소들 사이의 간격 설정 */
    z-index: 1000; /* 요소가 다른 요소 위에 보이도록 설정 */
}
/* 입력 필드 및 버튼 래퍼 */
#input-wrapper {
    display: flex;
    flex: 1; /* 입력 필드가 가능한 한 많이 차지하도록 설정 */
    position: relative; /* 버튼을 입력 필드 안에 위치시키기 위한 설정 */
    align-items: center;
    background-color: #444;
    border-radius: 15px;
}
/* 입력 필드 스타일 */
#user-input {
    align-content: center;
    width: 750px;
    padding-inline-start: 10px;
    border-radius: 15px; /* 입력 필드의 모서리 둥글게 하기 */
    box-sizing: border-box; /* 패딩과 테두리를 포함한 너비 계산 */
    font-size: 1rem; /* 모바일에서 확대 방지 */
    max-height: 200px;
    overflow-y: auto; /* 내용이 넘치면 스크롤바 표시 */
    resize: none; /* 사용자가 크기 조정 불가 */
    color: #bbb;
    background-color: #444;
    border-color: #444;
}
#user-input:focus {
    border: none; /* 포커스 시 테두리 제거 */
    outline: none; /* 기본 포커스 아웃라인 제거 */
}
/* 버튼 스타일 */
#send-button {
    position: fixed;
    right: 15px;
    bottom: 11px;
    padding: 10px;
    width: 38px; /* 버튼 너비 조정 */
    background-color: #888; /* 보라색 */
    color: #fff; /* 버튼 텍스트 색상 */
    border: none;
    border-radius: 40px;
    cursor: pointer;
    font-size: 1rem;
}
#send-button:hover {
    background-color: #7f7f7f; /* 다크 보라색 */
}

/* Additional styles for code blocks */

/* 코드 헤더 스타일 */
.code-header {
    display: flex; /* 플렉스박스 사용 */
    justify-content: space-between; /* 라벨과 버튼을 양 끝으로 배치 */
    align-items: center; /* 수직 중앙 정렬 */
    margin-bottom: 8px; /* 코드 블록과 코드 사이의 간격 */
    margin: -10px;
    background-color: #222;
}

.code-block {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px;
    background-color: #111;
    position: relative;
    margin-bottom: 20px;
}

.code-label {
    position: relative;
    /* top: -1px; */
    left: 0;
    background-color: #222;
    color: #bbb;
    padding: 5px;
    border-bottom: 1px solid #ddd;
    font-weight: bold;
}

.copy-button {
    background-color: #333; /* 버튼 배경색 */
    color: #bbb; /* 버튼 텍스트 색상 */
    border: none; /* 버튼 테두리 제거 */
    border-radius: 4px; /* 버튼 모서리 둥글게 */
    padding: 6px 12px; /* 버튼 패딩 */
    font-size: 14px; /* 버튼 텍스트 크기 */
    cursor: pointer; /* 마우스 커서 포인터로 변경 */
    transition: background-color 0.3s ease, transform 0.2s ease; /* 부드러운 배경색 전환과 클릭 효과 */
}

h2,strong,p,li {
    color: #bbb;
    padding: 10px;
}

textarea::placeholder {
  color: #bbb;
  font-weight: bold;
  
}

/* 버튼 호버 시 스타일 */
.copy-button:hover {
    background-color: #333; /* 호버 시 배경색 변경 */
}

/* 버튼 클릭 시 스타일 */
.copy-button:active {
    background-color: #333; /* 클릭 시 배경색 변경 */
    transform: scale(0.9); /* 클릭 시 버튼 살짝 작아지는 효과 */
}

pre {
  position: relative;
  overflow: visible;
}

/* 메시지 스타일 */
.message {
    border-radius: 10px;
    padding: 5px;
    margin: 5px;
    word-wrap: break-word;
    max-width: 80%; /* 최대 너비 설정 */
    align-self: flex-start; /* 메시지를 왼쪽 정렬 */
}
.user-message {
    background-color: #444;
    color: #fff;
    align-self: flex-end; /* 사용자의 메시지를 오른쪽 정렬 */
    margin-left: auto;
    padding: 10px;
}
.assistant-message {
    background-color: #222;
    color: #ffffff;
}
/* 코드 블록 기본 스타일 */
pre, code.hljs {
    display: block;
    overflow-x: auto;
    padding: 1em;
    background: #111;
    color: #f8f8f2;
    border-radius: 8px; /* 테두리 둥글게 하기 */
}
/* 코드 블록 내부 패딩 */
code.hljs {
    padding: 3px 5px;
}
/* 하이라이팅 기본 스타일 */
.hljs {
    background: #2e2e2e;
    color: #f8f8f2;
}
/* 주석 스타일 */
.hljs-comment {
    color: #909090;
}
/* 구문 및 태그 스타일 */
.hljs-punctuation,
.hljs-tag {
    color: #FFFFFF;
}
/* 속성, 문서 태그, 키워드, 메타 데이터 스타일 */
 .hljs-attribute {
     color: #00A67D;
 }
 .hljs-meta .hljs-keyword,
 .hljs-doctag,
 .hljs-name,
 .hljs-selector-tag {
     color: #2ebbd1;
 }
 .hljs-selector-ID {
     color: #e2bbd1;
 }
 .hljs-keyword,
 .hljs-tag .hljs-attr {
     color: #f92672;
 }

/* 삭제, 숫자, 인용, 클래스, 아이디, 문자열, 템플릿 태그, 타입 스타일 */
.hljs-number {
    color: #ae81ff;
}
.hljs-selector-class {
    color: #e2e629;
}
.hljs-deletion,
.hljs-quote,
.hljs-string,
.hljs-template-tag,
.hljs-type {
    color: #ae81ff;
}
/* 섹션 및 제목 스타일 */
.hljs-section,
.hljs-title {
    color: #e6db74;
}
/* 링크, 연산자, 정규 표현식, 속성, 의사 클래스, 기호, 템플릿 변수, 변수 스타일 */
.hljs-link,
.hljs-operator,
.hljs-regexp,
.hljs-selector-attr,
.hljs-selector-pseudo,
.hljs-symbol,
.hljs-template-variable,
.hljs-variable {
    color: #ab5656;
}
/* 리터럴 스타일 */
.hljs-literal {
    color: #695;
}
/* 추가, 내장, 총알, 코드 스타일 */
.hljs-addition,
.hljs-built_in,
.hljs-bullet,
.hljs-code {
    color: #397300;
}
/* 메타 데이터 스타일 */
.hljs-meta {
    color: #05db17;
}
/* 메타 데이터 문자열 스타일 */
.hljs-meta .hljs-string {
    color: #38a;
}
/* 강조된 텍스트 스타일 */
.hljs-emphasis {
    font-style: italic; /* 이탤릭체 */
}
/* 굵은 텍스트 스타일 */
.hljs-strong {
    font-weight: 700; /* 굵게 표시 */
}
/* 코드 블록의 스크롤바 스타일 (선택 사항) */
pre::-webkit-scrollbar {
    width: 12px;
}
pre::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 6px;
}
pre::-webkit-scrollbar-track {
    background: #333;
}
/* 모바일 환경에서의 스타일 */
@media (max-width: 768px) {
    #chat-container {
        width: 100%; /* 모바일에서는 너비를 좀 더 넓게 조정 */
    }
    #input-container {
        width: 95%;
    }
    #send-button {
        width: 38px;
    }
    #user-input {
        font-size: 1rem; /* 모바일에서 글꼴 크기 조정 */
        width: 88%;
    }

    
    
    .message {
    border-radius: 10px;
    /* padding: 10px; */
    word-wrap: break-word;
    max-width: 100%;
    align-self: flex-start;
    }
    .user-message {
        max-width: 80%;
    }
    .assistant-message {
        width: 95%;
    }
}
/* PC 환경에서의 스타일 */
@media (min-width: 769px) {
    #chat-container {
        width: 80%;
    }
}
