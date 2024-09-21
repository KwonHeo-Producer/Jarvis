# chain_service.py
from langchain_google_genai import ChatGoogleGenerativeAI

class CustomConversationChain:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.5)
        self.messages = []  # 대화 내용을 저장할 리스트

    def add_message(self, role, content):
        self.messages.append({"role": role, "content": content})

    def generate_response(self):
        # 대화 내용을 문자열로 합치기
        context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in self.messages])
        response = self.llm.predict(context)  # 모델에 대화 내용을 전달
        self.add_message("assistant", response)  # 모델의 응답 저장
        return response

    def print_conversation(self):
        # 대화 내용을 출력
        for msg in self.messages:
            print(f"{msg['role']}: {msg['content']}")

def initialize_chat_chain():
    return CustomConversationChain()
