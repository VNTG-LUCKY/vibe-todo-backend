const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const todoRouter = require('./routers/todos');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS 설정 - React 프론트엔드(localhost:5173) 허용
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Referrer-Policy 헤더 설정
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB 연결
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-db';

console.log('MongoDB 연결 시도 중...');
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // 5초 타임아웃
  retryWrites: true
})
  .then(() => {
    console.log('MongoDB 연결 성공');
  })
  .catch((error) => {
    console.error('MongoDB 연결 실패:', error.message);
    console.error('서버는 계속 실행되지만 데이터베이스 연결 없이 작동합니다.');
    console.error('MongoDB 연결 정보를 확인해주세요.');
    // 연결 실패해도 서버는 계속 실행
  });

// MongoDB 연결 상태 모니터링
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB 연결이 끊어졌습니다. 재연결을 시도합니다...');
  mongoose.connect(MONGODB_URI);
});

// Routes
// API 라우터는 정적 파일 서빙보다 먼저 등록해야 함
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 할일 라우터 (정적 파일 서빙보다 먼저!)
app.use('/api/todos', todoRouter);

// 정적 파일 서빙 (프론트엔드 파일) - API 라우터 이후에 등록
app.use(express.static('public'));

// 루트 경로는 프론트엔드 index.html을 서빙
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '요청한 리소스를 찾을 수 없습니다.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
