from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pydantic import BaseModel
import os
import uuid
from datetime import datetime, timedelta
from service.stock.stock_service import GoogleSheetsService
from chain_service import initialize_chat_chain

# 환경 변수 로드
load_dotenv('env/data.env')

app = FastAPI()

# 정적 파일 서빙
app.mount("/static", StaticFiles(directory="static"), name="static")

# Google Sheets API 설정
SPREADSHEET_ID = os.getenv("SPREADSHEET_ID")
SHEET_NAME = 'Stock'
sheets_service = GoogleSheetsService(
    spreadsheet_id=SPREADSHEET_ID,
    sheet_name=SHEET_NAME
)

# LangChain Chat 설정
sessions = {}

@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open("index.html", "r", encoding="utf-8") as file:
        return file.read()

class Message(BaseModel):
    prompt: str
    session_id: str

@app.post("/process_message")
async def process_message(request: Request):
    data = await request.json()
    prompt = data.get("prompt")
    session_id = data.get("session_id")

    if not prompt:
        raise HTTPException(status_code=400, detail="No prompt provided")

    if session_id not in sessions:
        sessions[session_id] = initialize_chat_chain()

    chat_chain = sessions[session_id]

    try:
        sheets_response = sheets_service.process_message(prompt)

        if 'response' in sheets_response:
            return {"response": sheets_response['response'], "session_id": session_id}

        response = chat_chain.run(prompt)
        return {"response": response, "session_id": session_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/end_session")
async def end_session(request: Request):
    data = await request.json()
    session_id = data.get("session_id")

    if session_id in sessions:
        del sessions[session_id]
        return {"message": "Session ended"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")
