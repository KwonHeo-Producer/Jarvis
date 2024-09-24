from fastapi import FastAPI, Request, HTTPException, UploadFile, File
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pydantic import BaseModel
import os
import shutil
from service.stock.stock_service import GoogleSheetsService
from chain_service import initialize_chat_chain
import markdown

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

    if not prompt:
        raise HTTPException(status_code=400, detail="No prompt provided")

    try:
        # Google Sheets에서 주식 관련 처리를 시도합니다.
        sheets_response = sheets_service.process_message(prompt)

        # 주식 관련 질문이 처리된 경우
        if 'response' in sheets_response:
            # Markdown 형식으로 응답을 변환합니다.
            markdown_response = sheets_response['response']
            html_response = markdown.markdown(markdown_response, extensions=['fenced_code'])
            return HTMLResponse(content=html_response)

        # 주식 관련 패턴이 아닌 경우 기본 대화 처리
        response = chat_chain.run(prompt)
        # Markdown 형식으로 응답을 변환합니다.
        html_response = markdown.markdown(response, extensions=['fenced_code'])
        return HTMLResponse(content=html_response)

    except Exception as e:
        # 모든 예외를 포괄적으로 처리합니다.
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload_image/")
async def upload_image(file: UploadFile = File(...)):
    # 이미지를 저장할 경로 설정
    upload_folder = "uploads/"
    os.makedirs(upload_folder, exist_ok=True)
    
    # 파일 저장
    file_location = f"{upload_folder}{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"filename": file.filename}
