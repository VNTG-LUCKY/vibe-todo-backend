# Firestore 설정 가이드

## 문제 해결: 데이터가 저장되지 않는 경우

### 1. Firestore Database 활성화
1. Firebase 콘솔 (https://console.firebase.google.com) 접속
2. 프로젝트 선택: `lucky-todo-backend`
3. 왼쪽 메뉴에서 "Firestore Database" 클릭
4. "데이터베이스 만들기" 클릭
5. "테스트 모드에서 시작" 선택 (개발용)
6. 위치 선택 (asia-northeast3 권장)

### 2. Firestore 보안 규칙 설정
1. Firestore Database 페이지에서 "규칙" 탭 클릭
2. 다음 규칙을 입력:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /todos/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. "게시" 버튼 클릭

### 3. 브라우저 콘솔 확인
1. 브라우저에서 F12 키를 눌러 개발자 도구 열기
2. "Console" 탭 확인
3. 할일 추가 시 나타나는 오류 메시지 확인

### 4. 일반적인 오류 해결

#### permission-denied 오류
- Firestore 보안 규칙이 올바르게 설정되었는지 확인
- 위의 보안 규칙을 다시 확인하고 게시

#### failed-precondition 오류
- Firestore 인덱스가 필요함
- 콘솔에 나타나는 링크를 클릭하여 인덱스 생성

#### unavailable 오류
- 인터넷 연결 확인
- Firebase 서비스 상태 확인

