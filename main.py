from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from service.stock.stock_service import GoogleSheetsService, GeminiService
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

# Gemini 서비스 객체 생성
gemini_service = GeminiService(api_key=os.getenv("GEMINI_API_KEY"))

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
            # 주식 관련 메시지인지 확인
            pattern = re.compile(r'^(.*)의 현재 주가는(?: 얼마야\?)?(?:\?)?$', re.UNICODE)
            match = pattern.match(prompt)

            if match:
                # 주식 관련 메시지일 경우 Google Sheets 처리
                response = sheets_service.process_message(prompt)
            else:
                # 주식 관련 메시지가 아닐 경우 Gemini API로 처리
                response = gemini_service.get_response(prompt)

            return response
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    return {"error": "No prompt provided"}
