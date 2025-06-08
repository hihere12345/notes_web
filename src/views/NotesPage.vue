<template>
  <div class="notes-container">
    <h1>我的笔记</h1>

    <button @click="openAddModal" class="action-button add-new-button">新增笔记</button>
    <button @click="fetchNotes" class="fetch-button">刷新笔记</button>
    <button @click="logout" class="logout-button">退出</button>
    <p v-if="loading" class="loading-message">正在加载笔记...</p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <div v-if="notes.length > 0" class="notes-list">
      <div v-for="note in notes" :key="note.id" class="note-item">
        <h3>{{ note.title }}</h3>
        <p>{{ note.content }}</p>
        <small>创建于: {{ new Date(note.created_at).toLocaleDateString() }}</small>
        <small> | </small>
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

    <Modal :show="showAddModal" title="新增笔记" @close="closeAddModal">
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
      <template #footer>
        <div class="modal-actions">
          <button @click="addNote" :disabled="isAdding" class="action-button primary-button">
            {{ isAdding ? '添加中...' : '创建' }}
          </button>
          <button @click="closeAddModal" class="action-button secondary-button">取消</button>
        </div>
        <p v-if="addErrorMessage" class="error-message">{{ addErrorMessage }}</p>
      </template>
    </Modal>

    <Modal :show="showEditModal" title="编辑笔记" @close="closeEditModal">
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
      <template #footer>
        <div class="modal-actions">
          <button @click="updateNote" :disabled="isUpdating" class="action-button primary-button">
            {{ isUpdating ? '更新中...' : '保存' }}
          </button>
          <button @click="closeEditModal" class="action-button secondary-button">取消</button>
        </div>
        <p v-if="editErrorMessage" class="error-message">{{ editErrorMessage }}</p>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { notesService } from '../api';
import { clearToken } from '../auth';
import { useRouter } from 'vue-router';
import Modal from '../components/ModalComponent.vue';

const notes = ref([]);
const loading = ref(false);
const errorMessage = ref('');

const newNote = ref({ title: '', content: '' });
const isAdding = ref(false);
const addErrorMessage = ref('');
const showAddModal = ref(false);

const showEditModal = ref(false);
const currentNote = ref({ id: '', title: '', content: '', createdAt: '' });
const isUpdating = ref(false);
const editErrorMessage = ref('');

const router = useRouter();

const fetchNotes = async () => {
  notes.value = [];
  errorMessage.value = '';
  loading.value = true;

  try {
    const response = await notesService.getNotes();
    notes.value = response.data;
  } catch (error) {
    console.error('获取笔记失败:', error);
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = `获取笔记失败：${error.response.data.message}`;
    } else {
      errorMessage.value = '获取笔记失败，请检查网络或服务器。';
    }
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  newNote.value = { title: '', content: '' };
  addErrorMessage.value = '';
  showAddModal.value = true;
};

const closeAddModal = () => {
  showAddModal.value = false;
};

const addNote = async () => {
  addErrorMessage.value = '';
  if (!newNote.value.title.trim() || !newNote.value.content.trim()) {
    addErrorMessage.value = '标题和内容不能为空。';
    return;
  }

  isAdding.value = true;

  try {
    const response = await notesService.addNote(newNote.value); // 使用封装的 API
    notes.value.unshift(response.data);
    closeAddModal();
  } catch (error) {
    console.error('添加笔记失败:', error);
    if (error.response && error.response.data && error.response.data.message) {
      addErrorMessage.value = `添加笔记失败：${error.response.data.message}`;
    } else {
      addErrorMessage.value = '添加笔记失败，请检查网络或服务器。';
    }
  } finally {
    isAdding.value = false;
  }
};

const openEditModal = (note) => {
  currentNote.value = { ...note };
  showEditModal.value = true;
  editErrorMessage.value = '';
};

const closeEditModal = () => {
  showEditModal.value = false;
};

const updateNote = async () => {
  editErrorMessage.value = '';
  if (!currentNote.value.title.trim() || !currentNote.value.content.trim()) {
    editErrorMessage.value = '标题和内容不能为空。';
    return;
  }

  isUpdating.value = true;

  try {
    const response = await notesService.updateNote(currentNote.value.id, {
      title: currentNote.value.title,
      content: currentNote.value.content,
    }); // 使用封装的 API
    const index = notes.value.findIndex(n => n.id === currentNote.value.id);
    if (index !== -1) {
      notes.value[index] = { ...response.data };
    }
    closeEditModal();
  } catch (error) {
    console.error('更新笔记失败:', error);
    if (error.response && error.response.data && error.response.data.message) {
      editErrorMessage.value = `更新笔记失败：${error.response.data.message}`;
    } else {
      editErrorMessage.value = '更新笔记失败，请检查网络或服务器。';
    }
  } finally {
    isUpdating.value = false;
  }
};

const confirmDelete = async (noteId) => {
  if (confirm('确定要删除这篇笔记吗？')) {
    await deleteNote(noteId);
  }
};

const deleteNote = async (noteId) => {
  try {
    await notesService.deleteNote(noteId); // 使用封装的 API
    notes.value = notes.value.filter(note => note.id !== noteId);
    alert('笔记删除成功！');
  } catch (error) {
    console.error('删除笔记失败:', error);
    if (error.response && error.response.data && error.response.data.message) {
      alert(`删除笔记失败：${error.response.data.message}`);
    } else {
      alert('删除笔记失败，请检查网络或服务器。');
    }
  }
};

const logout = () => {
  clearToken();
  alert('您已成功登出。');
  router.push('/');
};

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
  background-color: #28a745;
  margin-bottom: 20px;
}
.add-new-button:hover {
  background-color: #218838;
}

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
  background-color: #28a745;
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
  background-color: #3498db;
}
.fetch-button:hover {
  background-color: #2980b9;
}

.logout-button {
  background-color: #e74c3c;
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
  gap: 10px;
}

.edit-button {
  background-color: #ffc107;
}
.edit-button:hover {
  background-color: #e0a800;
}

.delete-button {
  background-color: #dc3545;
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
  background-color: #007bff;
}
.primary-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.secondary-button {
  background-color: #6c757d;
}
.secondary-button:hover {
  background-color: #545b62;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>