from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from starlette.responses import FileResponse

# 환경 변수 로드
load_dotenv('env/data.env')

# FastAPI 애플리케이션 생성
app = FastAPI()

# 정적 파일 서빙
app.mount("/static", StaticFiles(directory="static"), name="static")

# 초기화
def initialize():
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=1.0)
    memory = ConversationBufferMemory(return_messages=True, k=5)
    chain = ConversationChain(llm=llm, memory=memory)
    return chain

@app.get("/static/{filename}")
async def get_file(filename: str):
    response = FileResponse(f"static/{filename}")
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# 기본 UI 페이지
@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open("index.html", "r", encoding="utf-8") as file:
        return file.read()

# 메시지 처리 엔드포인트
@app.post("/process_message")
async def process_message(request: Request):
    data = await request.json()
    prompt = data.get("prompt")
    if prompt:
        chain = initialize()
        response_content = chain.run(prompt)
        return {"response": response_content}
    return {"error": "No prompt provided"}
