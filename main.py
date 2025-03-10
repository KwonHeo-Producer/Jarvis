from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pydantic import BaseModel
import os
from chain_service import initialize_chat_chain
import markdown

# 환경 변수 로드
load_dotenv('env/data.env')

app = FastAPI()

# 정적 파일 서빙
app.mount("/static", StaticFiles(directory="static"), name="static")

# LangChain Chat 설정
chat_chain = initialize_chat_chain()

@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open("index.html", "r", encoding="utf-8") as file:
        return file.read()

class Message(BaseModel):
    prompt: str

@app.post("/process_message")
async def process_message(request: Request):
    data = await request.json()
    prompt = data.get("prompt")

    if not prompt:
        raise HTTPException(status_code=400, detail="No prompt provided")

    try:
        # 기본 대화 처리
        response = chat_chain.run(prompt)
        # Markdown 형식으로 응답을 변환합니다.
        html_response = markdown.markdown(response, extensions=['fenced_code'])
        return HTMLResponse(content=html_response)

    except Exception as e:
        # 모든 예외를 포괄적으로 처리합니다.
        raise HTTPException(status_code=500, detail=str(e))
