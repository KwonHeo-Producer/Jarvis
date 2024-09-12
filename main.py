from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from service.stock.stock_service import GoogleSheetsService
from pydantic import BaseModel
import os
import json
import requests

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

# Gemini API 설정
GEMINI_API_URL = os.getenv("GEMINI_API_URL")  # Gemini API URL
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")  # Gemini API Key

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
            
            # Gemini API로 대화 처리
            gemini_response = process_with_gemini(prompt)
            return gemini_response

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    return {"error": "No prompt provided"}

def process_with_gemini(prompt: str) -> dict:
    headers = {
        "Authorization": f"Bearer {GEMINI_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "prompt": prompt
    }
    response = requests.post(GEMINI_API_URL, headers=headers, json=payload)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error from Gemini API")
