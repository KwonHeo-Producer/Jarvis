# Builder stage
FROM python:3.12-slim AS builder

WORKDIR /app
COPY requirements.txt .
RUN python -m ensurepip && \
    python -m pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Final stage
FROM python:3.12-slim

WORKDIR /app
COPY --from=builder /app /app

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
