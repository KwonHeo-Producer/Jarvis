import re
import json
from service.google_sheets_auth import initialize_google_sheets_service
from chain_service import initialize_chat_chain

class GoogleSheetsService:
    def __init__(self, spreadsheet_id: str, sheet_name: str):
        self.spreadsheet_id = spreadsheet_id
        self.sheet_name = sheet_name
        self.service = initialize_google_sheets_service()  # 구글 시트 서비스 초기화
        self.chain = initialize_chat_chain()  # LangChain 대화 체인 초기화

    def _load_tickers(self):
        # JSON 파일 경로 설정
        json_file_path = 'service/stock/stock_tickers.json'
        
        # JSON 파일에서 주식 티커를 로드
        with open(json_file_path, 'r', encoding='utf-8') as file:
            tickers = json.load(file)
        return tickers

    def _get_ticker_from_name(self, stock_name: str):
        # 주식 이름을 티커 심볼로 변환
        return self.tickers.get(stock_name, stock_name)  # 주식 이름이 없으면 원래 이름 반환

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
                    response_content = self.chain.run(chatbot_input)

                    # 응답 포맷을 B1의 값에 주식 이름과 함께 숫자를 추가
                    formatted_response = f"{stock_name}의 현재 주가는 {chatbot_input}"

                    return {
                        "response": formatted_response,
                        "status": "success",
                        "updatedCellsUserMessage": result_user_message.get('updatedCells')
                    }
                else:
                    return {"error": "B1 셀에 챗봇 입력이 없습니다."}

            except Exception as e:
                raise Exception(f"Error processing message: {str(e)}")
        else:
            # 주식 관련 패턴이 아닌 경우 일반 대화 처리
            try:
                response_content = self.chain.run(prompt)
                return {
                    "response": response_content,
                    "status": "success"
                }
            except Exception as e:
                raise Exception(f"Error processing general message: {str(e)}")
