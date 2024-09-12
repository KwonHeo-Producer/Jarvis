from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from service.stock.stock_service import GoogleSheetsService
from pydantic import BaseModel
import os

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
            # 특정 패턴이 포함된 경우에만 Google Sheets 코드 실행
            if "의 현재 주가는?" in prompt:
                response = sheets_service.process_message(prompt)
                return response
            
            # 일반적인 대화는 별도로 처리
            # 예: 아래는 임시로 설정한 챗봇 응답입니다.
            return {"response": f"챗봇의 응답: '{prompt}'에 대한 일반적인 대화 처리 중입니다.", "status": "success"}

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    return {"error": "No prompt provided"}
