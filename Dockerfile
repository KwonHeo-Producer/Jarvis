# 베이스 이미지 설정
FROM python:3.12

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사
COPY requirements.txt .

# 패키지 설치
RUN python -m ensurepip && \
    python -m pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 애플리케이션 파일 복사
COPY app.py .
COPY search_module.py .
COPY logoe.png .
COPY style.css .
COPY script.js .

# 애플리케이션 실행
CMD ["streamlit", "run", "app.py", "--server.port=8080", "--server.address=0.0.0.0"]