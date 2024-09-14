from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

def initialize_chat_chain():
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=1.0)
    memory = ConversationBufferMemory(return_messages=True, k=None)  # k=None으로 무제한 설정
    chain = ConversationChain(llm=llm, memory=memory)
    return chain
