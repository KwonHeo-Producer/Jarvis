# Build stage
FROM python:3.12-slim AS build

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사
COPY requirements.txt .

# 패키지 설치 및 캐시 삭제
RUN python -m ensurepip && \
    python -m pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    rm -rf /root/.cache

# Final stage
FROM python:3.12-slim

# 작업 디렉토리 설정
WORKDIR /app

# Build stage에서 필요한 파일 복사
COPY --from=build /app /app

# 애플리케이션 파일 복사
COPY . .

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
