import os
import json
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

class GoogleSheetsAuth:
    def __init__(self):
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
