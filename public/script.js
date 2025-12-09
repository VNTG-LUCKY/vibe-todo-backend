// 백엔드 API 엔드포인트
const API_BASE_URL = 'http://localhost:5000/api/todos';

// 할일 데이터 저장소
let todos = [];
let currentFilter = 'all';

// DOM 요소 가져오기
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const todoCount = document.getElementById('todoCount');
const filterBtns = document.querySelectorAll('.filter-btn');

// API 호출 헬퍼 함수
async function apiCall(endpoint, options = {}) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log('API 호출:', url, options.method || 'GET');
        
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        // 응답이 JSON인지 확인
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(`서버 응답이 JSON 형식이 아닙니다. 응답: ${text.substring(0, 100)}`);
        }

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API 호출 오류:', error);
        console.error('요청 URL:', `${API_BASE_URL}${endpoint}`);
        throw error;
    }
}

// 모든 할일 조회
async function loadTodos() {
    // 로딩 상태 표시
    todoList.innerHTML = '<div class="empty-state">할일을 불러오는 중...</div>';
    
    try {
        const response = await apiCall('/');
        
        if (response.success && response.data) {
            todos = response.data;
            renderTodos();
            console.log(`백엔드에서 ${todos.length}개의 할일을 불러왔습니다.`);
        } else {
            throw new Error(response.message || '할일을 불러오는데 실패했습니다.');
        }
    } catch (error) {
        console.error('할일을 불러오는 중 오류 발생:', error);
        todoList.innerHTML = `<div class="empty-state">할일을 불러올 수 없습니다.<br>${error.message}</div>`;
        alert(`할일을 불러오는 중 오류가 발생했습니다.\n\n${error.message}\n\n백엔드 서버(localhost:5000)가 실행 중인지 확인해주세요.`);
    }
}

// 통계 업데이트
function updateStats() {
    const activeTodos = todos.filter(todo => !todo.completed).length;
    todoCount.textContent = `${activeTodos}개의 할일`;
}

// 할일 추가
async function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        alert('할일을 입력해주세요!');
        return;
    }

    // 버튼 비활성화 (중복 클릭 방지)
    const originalBtnText = addBtn.textContent;
    addBtn.disabled = true;
    addBtn.textContent = '추가 중...';

    try {
        console.log('할일 추가 시작:', text);
        
        // 백엔드 API에 새 할일 추가
        const response = await apiCall('/', {
            method: 'POST',
            body: JSON.stringify({
                title: text,
                description: '',
                completed: false
            })
        });

        if (response.success && response.data) {
            console.log('할일이 백엔드에 성공적으로 추가되었습니다:', response.data);
            
            // 입력 필드 초기화
            todoInput.value = '';
            todoInput.focus();
            
            // 할일 목록 다시 불러오기
            await loadTodos();
        } else {
            throw new Error(response.message || '할일 추가에 실패했습니다.');
        }
    } catch (error) {
        console.error('할일 추가 중 오류 발생:', error);
        alert(`할일을 추가하는 중 오류가 발생했습니다.\n\n${error.message}`);
    } finally {
        // 항상 버튼 다시 활성화 (에러가 발생해도)
        addBtn.disabled = false;
        addBtn.textContent = originalBtnText;
    }
}

// 할일 삭제
async function deleteTodo(id) {
    if (confirm('정말 삭제하시겠습니까?')) {
        try {
            const response = await apiCall(`/${id}`, {
                method: 'DELETE'
            });

            if (response.success) {
                console.log('할일이 삭제되었습니다:', id);
                // 할일 목록 다시 불러오기
                await loadTodos();
            } else {
                throw new Error(response.message || '할일 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('할일 삭제 중 오류 발생:', error);
            alert(`할일을 삭제하는 중 오류가 발생했습니다.\n\n${error.message}`);
        }
    }
}

// 할일 완료 토글
async function toggleTodo(id) {
    const todo = todos.find(t => t._id === id || t.id === id);
    if (!todo) return;

    try {
        const response = await apiCall(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                completed: !todo.completed
            })
        });

        if (response.success) {
            console.log('할일 완료 상태가 업데이트되었습니다:', id);
            // 할일 목록 다시 불러오기
            await loadTodos();
        } else {
            throw new Error(response.message || '할일 업데이트에 실패했습니다.');
        }
    } catch (error) {
        console.error('할일 업데이트 중 오류 발생:', error);
        alert(`할일을 업데이트하는 중 오류가 발생했습니다.\n\n${error.message}`);
    }
}

// 할일 수정 모드 진입
function editTodo(id) {
    const todo = todos.find(t => t._id === id || t.id === id);
    if (!todo) return;

    const todoItem = document.querySelector(`[data-id="${id}"]`);
    const todoText = todoItem.querySelector('.todo-text');
    const todoActions = todoItem.querySelector('.todo-actions');

    // 편집 모드로 전환
    const originalText = todoText.textContent;
    todoText.contentEditable = true;
    todoText.classList.add('editing');
    todoText.focus();

    // 기존 버튼 숨기기
    const safeId = String(id).replace(/'/g, "\\'");
    const safeText = originalText.replace(/'/g, "\\'").replace(/"/g, "&quot;");
    todoActions.innerHTML = `
        <button class="btn-save" onclick="saveEdit('${safeId}')">저장</button>
        <button class="btn-cancel" onclick="cancelEdit('${safeId}', '${safeText}')">취소</button>
    `;

    // Enter 키로 저장, Escape 키로 취소
    todoText.onkeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveEdit(id);
        } else if (e.key === 'Escape') {
            cancelEdit(id, originalText);
        }
    };
}

// 할일 수정 저장
async function saveEdit(id) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    const todoText = todoItem.querySelector('.todo-text');
    const newText = todoText.textContent.trim();

    if (newText === '') {
        alert('할일 내용을 입력해주세요!');
        return;
    }

    try {
        const response = await apiCall(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                title: newText
            })
        });

        if (response.success) {
            console.log('할일이 수정되었습니다:', id);
            // 할일 목록 다시 불러오기
            await loadTodos();
        } else {
            throw new Error(response.message || '할일 수정에 실패했습니다.');
        }
    } catch (error) {
        console.error('할일 수정 중 오류 발생:', error);
        alert(`할일을 수정하는 중 오류가 발생했습니다.\n\n${error.message}`);
    }
}

// 할일 수정 취소
function cancelEdit(id, originalText) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    const todoText = todoItem.querySelector('.todo-text');
    const todoActions = todoItem.querySelector('.todo-actions');

    todoText.contentEditable = false;
    todoText.classList.remove('editing');
    todoText.textContent = originalText;

    // 원래 버튼 복원
    const safeId = String(id).replace(/'/g, "\\'");
    todoActions.innerHTML = `
        <button class="btn-edit" onclick="editTodo('${safeId}')">수정</button>
        <button class="btn-delete" onclick="deleteTodo('${safeId}')">삭제</button>
    `;
}

// 필터링된 할일 목록 가져오기
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// 할일 목록 렌더링
function renderTodos() {
    const filteredTodos = getFilteredTodos();

    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">할일이 없습니다</div>';
        updateStats();
        return;
    }

    todoList.innerHTML = filteredTodos.map(todo => {
        // MongoDB _id 또는 id 사용
        const todoId = todo._id || todo.id;
        const safeId = String(todoId).replace(/'/g, "\\'");
        // title 필드 사용 (백엔드 API에 맞춤)
        const todoTitle = todo.title || todo.text || '';
        
        return `
        <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todoId}">
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''} 
                onchange="toggleTodo('${safeId}')"
            >
            <span class="todo-text">${escapeHtml(todoTitle)}</span>
            <div class="todo-actions">
                <button class="btn-edit" onclick="editTodo('${safeId}')">수정</button>
                <button class="btn-delete" onclick="deleteTodo('${safeId}')">삭제</button>
            </div>
        </div>
    `;
    }).join('');

    updateStats();
}

// HTML 이스케이프 (XSS 방지)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 필터 변경
function setFilter(filter) {
    currentFilter = filter;
    
    // 필터 버튼 활성화 상태 업데이트
    filterBtns.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    renderTodos();
}

// 이벤트 리스너
addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

// 전역 함수로 내보내기 (HTML onclick에서 사용하기 위해)
window.toggleTodo = toggleTodo;
window.editTodo = editTodo;
window.deleteTodo = deleteTodo;
window.saveEdit = saveEdit;
window.cancelEdit = cancelEdit;

// 앱 초기화
loadTodos();
