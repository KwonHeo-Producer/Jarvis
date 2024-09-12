from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pydantic import BaseModel
import os
from service.stock.stock_service import GoogleSheetsService
from chain_service import initialize_chat_chain  # chain_service 모듈에서 initialize_chat_chain을 가져옵니다.

# 환경 변수 로드
load_dotenv('env/data.env')

app = FastAPI()

# 정적 파일 서빙
app.mount("/static", StaticFiles(directory="static"), name="static")

# Google Sheets API 설정
SPREADSHEET_ID = os.getenv("SPREADSHEET_ID")  # 환경 변수로 구글 시트 ID 가져오기
SHEET_NAME = 'Stock'  # 시트 이름

# Google Sheets 서비스 객체 생성
sheets_service = GoogleSheetsService(
    spreadsheet_id=SPREADSHEET_ID,
    sheet_name=SHEET_NAME
)

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

    if prompt:
        try:
            # LangChain을 사용하여 메시지를 처리합니다.
            response = chat_chain.run(prompt)  # LangChain의 ConversationChain을 사용하여 응답 생성
            # Google Sheets에 결과를 기록합니다.
            sheets_service.process_message(prompt)
            return {"response": response}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    return {"error": "No prompt provided"}
