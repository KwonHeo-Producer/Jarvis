from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from service.stock.stock_service import process_stock_request
from chain_service import initialize_chat_chain  # 랭체인 관련 기능 임포트

# 환경 변수 로드
load_dotenv('env/data.env')

app = FastAPI()

# 정적 파일 서빙
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open("index.html", "r", encoding="utf-8") as file:
        return file.read()

@app.post("/process_message")
async def process_message(request: Request):
    data = await request.json()
    prompt = data.get("prompt")

    if prompt:
        # 챗봇 대화 체인을 통해 응답 생성
        chain = initialize_chat_chain()
        response_content = chain.run(prompt)
        return {"response": response_content}

    return {"error": "No prompt provided"}
