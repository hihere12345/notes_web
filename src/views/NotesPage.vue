<template>
  <div class="notes-container">
    <h1>我的笔记</h1>

    <button @click="openAddModal" class="action-button add-new-button">新增笔记</button>

    <button @click="fetchNotes" class="fetch-button">刷新笔记</button>
    <p v-if="loading" class="loading-message">正在加载笔记...</p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <div v-if="notes.length > 0" class="notes-list">
      <div v-for="note in notes" :key="note.id" class="note-item">
        <h3>{{ note.title }}</h3>
        <p>{{ note.content }}</p>
        <small>创建于: {{ new Date(note.created_at).toLocaleDateString() }}</small>
        <small> ｜ </small>
        <small>更新于: {{ new Date(note.update_at).toLocaleDateString() }}</small>
        <div class="note-actions">
          <button @click="openEditModal(note)" class="action-button edit-button">编辑</button>
          <button @click="confirmDelete(note.id)" class="action-button delete-button">删除</button>
        </div>
      </div>
    </div>
    <p v-else-if="!loading && !errorMessage" class="no-notes-message">
      您还没有任何笔记。
    </p>

    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal-content">
        <h2>新增笔记</h2>
        <input
          v-model="newNote.title"
          placeholder="笔记标题"
          class="form-input"
          aria-label="新笔记标题"
        />
        <textarea
          v-model="newNote.content"
          placeholder="笔记内容"
          class="form-textarea"
          aria-label="新笔记内容"
        ></textarea>
        <div class="modal-actions">
          <button @click="addNote" :disabled="isAdding" class="action-button primary-button">
            {{ isAdding ? '添加中...' : '创建' }}
          </button>
          <button @click="closeAddModal" class="action-button secondary-button">取消</button>
        </div>
        <p v-if="addErrorMessage" class="error-message">{{ addErrorMessage }}</p>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <h2>编辑笔记</h2>
        <input
          v-model="currentNote.title"
          placeholder="笔记标题"
          class="form-input"
          aria-label="编辑笔记标题"
        />
        <textarea
          v-model="currentNote.content"
          placeholder="笔记内容"
          class="form-textarea"
          aria-label="编辑笔记内容"
        ></textarea>
        <div class="modal-actions">
          <button @click="updateNote" :disabled="isUpdating" class="action-button primary-button">
            {{ isUpdating ? '更新中...' : '保存' }}
          </button>
          <button @click="closeEditModal" class="action-button secondary-button">取消</button>
        </div>
        <p v-if="editErrorMessage" class="error-message">{{ editErrorMessage }}</p>
      </div>
    </div>

    <button @click="logout" class="logout-button">退出</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const notes = ref([]);
const loading = ref(false);
const errorMessage = ref('');

// 新增笔记相关
const newNote = ref({ title: '', content: '' });
const isAdding = ref(false);
const addErrorMessage = ref('');
const showAddModal = ref(false); // **新增：控制新增笔记模态框的显示**

// 编辑模态框相关
const showEditModal = ref(false);
const currentNote = ref({ id: '', title: '', content: '', createdAt: '' });
const isUpdating = ref(false);
const editErrorMessage = ref('');

const router = useRouter();
const API_BASE_URL = 'http://localhost:8000'; // 你的后端API地址

// 辅助函数：获取 Bearer Token 的 Axios 配置
const getAuthHeaders = () => {
  const token = localStorage.getItem('user_token');
  if (!token) {
    errorMessage.value = '错误：未找到认证信息，请重新登录。';
    router.push('/');
    return null;
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// --- CRUD 操作 ---

// 获取笔记列表 (保持不变)
const fetchNotes = async () => {
  notes.value = [];
  errorMessage.value = '';
  loading.value = true;
  const authHeaders = getAuthHeaders();
  if (!authHeaders) {
    loading.value = false;
    return;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/notes/`, authHeaders);
    notes.value = response.data;
  } catch (error) {
    console.error('获取笔记失败:', error);
    if (error.response && error.response.status === 401) {
      errorMessage.value = '认证失败，请重新登录。';
      localStorage.removeItem('user_token');
      router.push('/');
    } else if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = `获取笔记失败：${error.response.data.message}`;
    } else {
      errorMessage.value = '获取笔记失败，请检查网络或服务器。';
    }
  } finally {
    loading.value = false;
  }
};

// **新增：打开新增笔记模态框**
const openAddModal = () => {
  newNote.value = { title: '', content: '' }; // 清空表单
  addErrorMessage.value = ''; // 清除错误信息
  showAddModal.value = true;
};

// **新增：关闭新增笔记模态框**
const closeAddModal = () => {
  showAddModal.value = false;
};

// 添加笔记
const addNote = async () => {
  addErrorMessage.value = '';
  if (!newNote.value.title.trim() || !newNote.value.content.trim()) {
    addErrorMessage.value = '标题和内容不能为空。';
    return;
  }

  isAdding.value = true;
  const authHeaders = getAuthHeaders();
  if (!authHeaders) {
    isAdding.value = false;
    return;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/notes/`, newNote.value, authHeaders);
    notes.value.unshift(response.data); // 将新笔记添加到列表开头
    closeAddModal(); // **修改：添加成功后关闭模态框**
  } catch (error) {
    console.error('添加笔记失败:', error);
    if (error.response && error.response.status === 401) {
      addErrorMessage.value = '认证失败，请重新登录。';
      localStorage.removeItem('user_token');
      router.push('/');
    } else if (error.response && error.response.data && error.response.data.message) {
      addErrorMessage.value = `添加笔记失败：${error.response.data.message}`;
    } else {
      addErrorMessage.value = '添加笔记失败，请检查网络或服务器。';
    }
  } finally {
    isAdding.value = false;
  }
};

// 打开编辑模态框 (保持不变)
const openEditModal = (note) => {
  currentNote.value = { ...note };
  showEditModal.value = true;
  editErrorMessage.value = '';
};

// 关闭编辑模态框 (保持不变)
const closeEditModal = () => {
  showEditModal.value = false;
};

// 更新笔记 (保持不变)
const updateNote = async () => {
  editErrorMessage.value = '';
  if (!currentNote.value.title.trim() || !currentNote.value.content.trim()) {
    editErrorMessage.value = '标题和内容不能为空。';
    return;
  }

  isUpdating.value = true;
  const authHeaders = getAuthHeaders();
  if (!authHeaders) {
    isUpdating.value = false;
    return;
  }

  try {
    const response = await axios.put(
      `${API_BASE_URL}/notes/${currentNote.value.id}/`,
      { title: currentNote.value.title, content: currentNote.value.content },
      authHeaders
    );
    const index = notes.value.findIndex(n => n.id === currentNote.value.id);
    if (index !== -1) {
      notes.value[index] = { ...response.data };
    }
    closeEditModal();
  } catch (error) {
    console.error('更新笔记失败:', error);
    if (error.response && error.response.status === 401) {
      editErrorMessage.value = '认证失败，请重新登录。';
      localStorage.removeItem('user_token');
      router.push('/');
    } else if (error.response && error.response.data && error.response.data.message) {
      editErrorMessage.value = `更新笔记失败：${error.response.data.message}`;
    } else {
      editErrorMessage.value = '更新笔记失败，请检查网络或服务器。';
    }
  } finally {
    isUpdating.value = false;
  }
};

// 确认删除笔记 (保持不变)
const confirmDelete = async (noteId) => {
  if (confirm('确定要删除这篇笔记吗？')) {
    await deleteNote(noteId);
  }
};

// 删除笔记 (保持不变)
const deleteNote = async (noteId) => {
  const authHeaders = getAuthHeaders();
  if (!authHeaders) return;

  try {
    await axios.delete(`${API_BASE_URL}/notes/${noteId}/`, authHeaders);
    notes.value = notes.value.filter(note => note.id !== noteId);
    alert('笔记删除成功！');
  } catch (error) {
    console.error('删除笔记失败:', error);
    if (error.response && error.response.status === 401) {
      alert('认证失败，请重新登录。');
      localStorage.removeItem('user_token');
      router.push('/');
    } else if (error.response && error.response.data && error.response.data.message) {
      alert(`删除笔记失败：${error.response.data.message}`);
    } else {
      alert('删除笔记失败，请检查网络或服务器。');
    }
  }
};

// 登出功能 (保持不变)
const logout = () => {
  localStorage.removeItem('user_token');
  alert('您已成功登出。');
  router.push('/');
};

// 组件挂载时自动获取笔记 (保持不变)
onMounted(() => {
  fetchNotes();
});
</script>

<style scoped>
.notes-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 80vh;
  padding: 20px;
  background-color: #f0f4f8;
  text-align: center;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2.5em;
}

.add-new-button {
  background-color: #28a745; /* 绿色 */
  margin-bottom: 20px; /* 和其他按钮保持距离 */
}
.add-new-button:hover {
  background-color: #218838;
}

/* 新增笔记表单样式 */
/* .add-note-form {
  background-color: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 600px;
  margin-bottom: 30px;
  text-align: left;
}

.add-note-form h2 {
  margin-top: 0;
  color: #34495e;
  font-size: 1.8em;
  margin-bottom: 20px;
} */

.form-input,
.form-textarea {
  width: calc(100% - 20px);
  padding: 12px 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  box-sizing: border-box;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.action-button {
  padding: 10px 20px;
  margin: 5px;
  font-size: 1em;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border: none;
  color: white;
}

.add-button {
  background-color: #28a745; /* 绿色 */
}
.add-button:hover:not(:disabled) {
  background-color: #218838;
}

.fetch-button, .logout-button {
  padding: 10px 20px;
  margin: 10px;
  font-size: 1em;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border: none;
  color: white;
}

.fetch-button {
  background-color: #3498db; /* 蓝色 */
}
.fetch-button:hover {
  background-color: #2980b9;
}

.logout-button {
  background-color: #e74c3c; /* 红色 */
  margin-top: 40px;
}
.logout-button:hover {
  background-color: #c0392b;
}

.loading-message,
.error-message,
.no-notes-message {
  margin-top: 20px;
  font-size: 1.1em;
}

.loading-message {
  color: #3498db;
}

.error-message {
  color: #e74c3c;
  font-weight: bold;
}

.no-notes-message {
  color: #7f8c8d;
}

.notes-list {
  width: 100%;
  max-width: 800px;
  margin-top: 20px;
  text-align: left;
}

.note-item {
  background-color: white;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.note-item:hover {
  transform: translateY(-3px);
}

.note-item h3 {
  color: #34495e;
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.5em;
}

.note-item p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 10px;
}

.note-item small {
  color: #7f8c8d;
  font-size: 0.9em;
}

.note-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px; /* 按钮之间的间距 */
}

.edit-button {
  background-color: #ffc107; /* 琥珀色 */
}
.edit-button:hover {
  background-color: #e0a800;
}

.delete-button {
  background-color: #dc3545; /* 红色 */
}
.delete-button:hover {
  background-color: #c82333;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  text-align: left;
  position: relative;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #34495e;
  font-size: 2em;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.primary-button {
  background-color: #007bff; /* 蓝色 */
}
.primary-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.secondary-button {
  background-color: #6c757d; /* 灰色 */
}
.secondary-button:hover {
  background-color: #545b62;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>