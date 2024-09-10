import json
from googleapiclient.discovery import build
from google.oauth2 import service_account

# Google Sheets API 설정
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
SERVICE_ACCOUNT_FILE = 'service/stock/credentials.json'

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)
service = build('sheets', 'v4', credentials=credentials)

# 시트 ID와 범위 설정
SHEET_ID = '1dVus-RNy9g2TBXTpw3BLMG-GIkuVyIx92Bz-LKSz7rQ'
INPUT_RANGE = 'A1'
OUTPUT_RANGE = 'B1'

# 주식 이름과 티커 매핑 데이터 로드
with open('service/stock/stock_tickers.json', 'r', encoding='utf-8') as file:
    stock_tickers = json.load(file)

def update_sheet(sheet_id: str, range_name: str, value: str):
    values = [[value]]
    body = {
        'values': values
    }
    service.spreadsheets().values().update(
        spreadsheetId=sheet_id,
        range=range_name,
        valueInputOption='RAW',
        body=body
    ).execute()

def get_sheet_value(sheet_id: str, range_name: str) -> str:
    sheet = service.spreadsheets().values().get(spreadsheetId=sheet_id, range=range_name).execute()
    values = sheet.get('values', [])
    if values:
        return values[0][0]
    return ''

def get_ticker_from_name(name: str) -> str:
    return stock_tickers.get(name, '')

def process_stock_request(prompt: str):
    if "의 현재 주가를 알려줘" in prompt or "의 현재 주가는?" in prompt:
        stock_name = prompt.replace("의 현재 주가를 알려줘", "").replace("의 현재 주가는?", "").strip()
        ticker = get_ticker_from_name(stock_name)
        if ticker:
            update_sheet(SHEET_ID, INPUT_RANGE, ticker)
            result = get_sheet_value(SHEET_ID, OUTPUT_RANGE)
            return {"response": result}
        return {"error": f"Stock name '{stock_name}' not found in mapping."}
    return None
