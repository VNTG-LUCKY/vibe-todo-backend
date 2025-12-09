const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Todo = require('../models/Todo');

// 모든 할일 조회 라우터
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 }); // 최신순 정렬

    res.status(200).json({
      success: true,
      message: '할일 목록을 성공적으로 조회했습니다.',
      count: todos.length,
      data: todos
    });
  } catch (error) {
    console.error('할일 조회 오류:', error);
    
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 특정 할일 조회 라우터
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 유효한 MongoDB ObjectId 형식인지 확인
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 할일 ID입니다.'
      });
    }

    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '할일을 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      message: '할일을 성공적으로 조회했습니다.',
      data: todo
    });
  } catch (error) {
    console.error('할일 조회 오류:', error);
    
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 할일 생성 라우터
router.post('/', async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: '데이터베이스에 연결할 수 없습니다. MongoDB가 실행 중인지 확인해주세요.'
      });
    }

    // 제목이 없으면 에러 반환
    if (!title || title.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: '할일 제목은 필수입니다.' 
      });
    }

    // 새 할일 생성
    const todo = new Todo({
      title: title.trim(),
      description: description ? description.trim() : '',
      completed: completed || false
    });

    // 데이터베이스에 저장
    const savedTodo = await todo.save();

    res.status(201).json({
      success: true,
      message: '할일이 성공적으로 생성되었습니다.',
      data: savedTodo
    });
  } catch (error) {
    console.error('할일 생성 오류:', error);
    console.error('에러 상세:', error.stack);
    
    // Mongoose 검증 오류 처리
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }

    // MongoDB 연결 오류 처리
    if (error.name === 'MongoServerError' || error.name === 'MongooseError') {
      return res.status(503).json({
        success: false,
        message: '데이터베이스 연결 오류가 발생했습니다.',
        error: error.message
      });
    }

    // 기타 오류는 next로 전달하지 않고 직접 처리
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 할일 수정 라우터
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    // 유효한 MongoDB ObjectId 형식인지 확인
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 할일 ID입니다.'
      });
    }

    // 할일 찾기
    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '할일을 찾을 수 없습니다.'
      });
    }

    // 수정할 데이터 준비
    const updateData = {};
    
    if (title !== undefined) {
      if (title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: '할일 제목은 필수입니다.'
        });
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    if (completed !== undefined) {
      updateData.completed = completed;
    }

    // 할일 수정
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true } // new: true는 업데이트된 문서 반환, runValidators: true는 스키마 검증 실행
    );

    res.status(200).json({
      success: true,
      message: '할일이 성공적으로 수정되었습니다.',
      data: updatedTodo
    });
  } catch (error) {
    console.error('할일 수정 오류:', error);
    
    // Mongoose 검증 오류 처리
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 할일 삭제 라우터
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 유효한 MongoDB ObjectId 형식인지 확인
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 할일 ID입니다.'
      });
    }

    // 할일 찾기 및 삭제
    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return res.status(404).json({
        success: false,
        message: '할일을 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      message: '할일이 성공적으로 삭제되었습니다.',
      data: deletedTodo
    });
  } catch (error) {
    console.error('할일 삭제 오류:', error);
    
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;

