const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '할일 제목은 필수입니다.'],
    trim: true,
    maxlength: [200, '할일 제목은 200자 이하여야 합니다.']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, '할일 설명은 1000자 이하여야 합니다.']
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // createdAt과 updatedAt을 자동으로 관리
});

// timestamps: true 옵션이 있으므로 pre 훅이 필요 없음

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;

