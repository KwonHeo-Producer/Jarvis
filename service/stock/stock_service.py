import re
from chain_service import initialize_chat_chain
import os
import json
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

class GoogleSheetsService:
    def __init__(self, spreadsheet_id: str, sheet_name: str):
        self.spreadsheet_id = spreadsheet_id
        self.sheet_name = sheet_name
        self.service = self._initialize_service()

    def _initialize_service(self):
        # 환경 변수에서 JSON 인증 정보를 가져오기
        credentials_json = os.getenv('GOOGLE_APPLICATION_CREDENTIALS_JSON')
        if not credentials_json:
            raise ValueError("Environment variable 'GOOGLE_APPLICATION_CREDENTIALS_JSON' is not set or is empty.")
        
        try:
            service_account_info = json.loads(credentials_json)
        except json.JSONDecodeError as e:
            raise ValueError("Error decoding JSON from 'GOOGLE_APPLICATION_CREDENTIALS_JSON': " + str(e))
        
        # 서비스 계정으로부터 자격 증명 생성
        creds = Credentials.from_service_account_info(service_account_info)
        service = build('sheets', 'v4', credentials=creds)
        return service

    def update_cell(self, cell_range: str, value: str):
        sheet = self.service.spreadsheets()
        body = {
            'values': [[value]]
        }
        result = sheet.values().update(
            spreadsheetId=self.spreadsheet_id,
            range=cell_range,
            valueInputOption='RAW',
            body=body
        ).execute()
        return result

    def get_cell_value(self, cell_range: str):
        sheet = self.service.spreadsheets()
        result = sheet.values().get(
            spreadsheetId=self.spreadsheet_id,
            range=cell_range
        ).execute()
        values = result.get('values', [])
        return values[0][0] if values else None

    def process_message(self, prompt: str):
        # LangChain 대화 체인 초기화
        chain = initialize_chat_chain()

        # 특정 패턴이 포함된 경우에만 Google Sheets에 기록
        pattern = re.compile(r'^(.*)의 현재 주가는(?: 얼마야\?)?(?:\?)?$', re.UNICODE)
        match = pattern.match(prompt)

        if match:
            stock_name = match.group(1).strip()  # 주식 이름 추출

            try:
                # A1 셀에 주식 이름 기록
                range_user_message = f'{self.sheet_name}!A1'
                result_user_message = self.update_cell(
                    cell_range=range_user_message,
                    value=stock_name
                )

                # B1 셀에서 챗봇의 입력을 읽기
                range_chatbot_input = f'{self.sheet_name}!B1'
                chatbot_input = self.get_cell_value(cell_range=range_chatbot_input)

                if chatbot_input:
                    # 챗봇 대화 체인을 통해 응답 생성
                    response_content = chain.run(chatbot_input)

                    # 응답에서 숫자와 주식 이름만 추출하여 포맷
                    match = re.search(r'(\d+\.\d+)', response_content)
                    if match:
                        response_number = match.group(1)
                        formatted_response = f"{stock_name}의 현재 주가는 {response_number} 입니다."
                    else:
                        formatted_response = f"{stock_name}의 현재 주가는 알 수 없습니다."

                    return {
                        "response": formatted_response,
                        "status": "success",
                        "updatedCellsUserMessage": result_user_message.get('updatedCells')
                    }
                else:
                    return {"error": "B1 셀에 챗봇 입력이 없습니다."}

            except Exception as e:
                return {"error": f"Error processing stock message: {str(e)}"}
        else:
            # 주식 관련 패턴이 아닌 경우 일반 대화 처리
            try:
                response_content = chain.run(prompt)
                return {
                    "response": response_content,
                    "status": "success"
                }
            except Exception as e:
                return {"error": f"Error processing general message: {str(e)}"}
