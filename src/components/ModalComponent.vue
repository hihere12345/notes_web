<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <slot name="header">
        <h2>{{ title }}</h2>
      </slot>
      <slot></slot> <slot name="footer"></slot> </div>
  </div>
</template>

<script setup>
/* eslint-disable no-unused-vars */
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '模态框',
  },
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};
</script>

<style scoped>
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

</style>