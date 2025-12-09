const express = require('express');
// path 모듈은 index.html을 안 쓴다면 굳이 필요 없지만 둬도 됩니다.
// const path = require('path'); 
const cors = require('cors');
const mongoose = require('mongoose');
const todoRouter = require('./routers/todos');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// [수정 1] CORS 설정: 일단 배포 테스트를 위해 모두 허용
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB 연결 (환경변수 없으면 에러 로그 출력되도록 유지)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-db';

console.log('MongoDB 연결 시도 중...');
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  retryWrites: true
})
  .then(() => console.log('MongoDB 연결 성공'))
  .catch((error) => {
    console.error('MongoDB 연결 실패. 환경변수 MONGODB_URI를 확인하세요.');
    // DB 없어도 서버는 켜지도록 유지
  });

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB 재연결 시도...');
  mongoose.connect(MONGODB_URI);
});

// Routes
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/todos', todoRouter);

// [삭제 또는 주석 처리] 정적 파일 서빙은 프론트엔드가 따로 있다면 불필요
// app.use(express.static('public'));

// [수정 2] 루트 접속 시 간단한 메시지 출력 (파일 찾기 에러 방지)
app.get('/', (req, res) => {
  res.send('Vibe Todo Backend Server is Running!');
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ success: false, message: '요청한 리소스를 찾을 수 없습니다.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});