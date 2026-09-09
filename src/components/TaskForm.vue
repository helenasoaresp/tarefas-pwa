<template>
  <form class="task-form" @submit.prevent="handleSubmit">
    <div class="task-row">
      <input
        v-model="newTask"
        type="text"
        placeholder="Nova tarefa..."
        class="task-input"
      />

      <button
        type="submit"
        class="task-button"
        :disabled="uploading"
      >
        {{ editingTask ? 'Alterar' : 'Adicionar' }}
      </button>

      <button
        v-if="editingTask"
        type="button"
        class="task-button-cancel"
        @click="handleCancel"
      >
        Cancelar
      </button>

      <button
        type="button"
        class="task-button-secondary"
        @click="handleGetLocation"
        :disabled="loadingLocation"
      >
        {{
          loadingLocation
            ? 'Obtendo localização...'
            : 'Usar minha localização'
        }}
      </button>
    </div>

    <div v-if="location" class="location-section">
      <p v-if="location.label">
        <strong>Endereço:</strong>
        {{ location.label }}
      </p>

      <p>
        <strong>Latitude:</strong>
        {{ location.latitude }}
      </p>

      <p>
        <strong>Longitude:</strong>
        {{ location.longitude }}
      </p>

      <p v-if="location.accuracy != null">
        <strong>Precisão:</strong>
        {{ location.accuracy }} metros
      </p>

      <TaskLocationMap :location="location" />

      <button
        type="button"
        class="task-button-cancel"
        @click="handleRemoveLocation"
      >
        Remover localização
      </button>
    </div>

    <p v-if="locationError" class="location-error">
      {{ locationError }}
    </p>

    <div class="image-section">
      <img
        v-if="previewUrl || editingTask?.img_url"
        :src="previewUrl || editingTask?.img_url"
        class="image-preview"
        alt="Imagem da tarefa"
      />

      <label
        class="image-label"
        :class="{ disabled: uploading }"
      >
        <span v-if="uploading" class="upload-status">
          Enviando...
        </span>

        <span v-else>
          {{
            previewUrl || editingTask?.img_url
              ? 'Trocar imagem'
              : 'Adicionar imagem'
          }}
        </span>

        <input
          type="file"
          accept="image/jpeg,image/png"
          capture="environment"
          class="image-input"
          :disabled="uploading"
          @change="handleImageChange"
        />
      </label>

      <p v-if="imageError" class="image-error">
        {{ imageError }}
      </p>

      <button
        type="button"
        class="task-button-secondary"
        @click="showCameraCapture = !showCameraCapture"
      >
        {{
          showCameraCapture
            ? 'Fechar câmera'
            : 'Abrir preview ao vivo'
        }}
      </button>

      <CameraCapture
        v-if="showCameraCapture"
        @captured="handleCameraCapture"
      />
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import tasksApi from '../api/tasksApi.js'
import CameraCapture from './CameraCapture.vue'
import TaskLocationMap from './TaskLocationMap.vue'
import geocodingApi from '../api/geocodingApi.js'
import { useGeolocation } from '../composables/useGeolocation'
import { buildLocationPayload } from '../utils/location.js'

const {
  location,
  loadingLocation,
  locationError,
  requestCurrentLocation,
  setLocationFromTask,
  clearLocation,
  setLocationLabel,
} = useGeolocation()

const props = defineProps({
  editingTask: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits([
  'add',
  'update',
  'cancel',
])

const newTask = ref('')
const previewUrl = ref(null)
const imgAttachmentKey = ref(null)
const uploading = ref(false)
const showCameraCapture = ref(false)
const imageError = ref('')

async function handleGetLocation() {
  const captured = await requestCurrentLocation()

  if (!captured) return

  try {
    const address = await geocodingApi.reverse(
      captured.latitude,
      captured.longitude,
    )

    setLocationLabel(address?.label)
  } catch {
    locationError.value =
      'Localização obtida, mas não foi possível identificar a rua.'
  }
}

function handleRemoveLocation() {
  clearLocation()
}

watch(
  () => props.editingTask,
  (task) => {
    newTask.value = task ? task.title : ''

    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }

    previewUrl.value = null
    imgAttachmentKey.value = null
    showCameraCapture.value = false
    imageError.value = ''

    setLocationFromTask(task)
  },
  { immediate: true },
)

function handleSubmit() {
  if (!newTask.value.trim()) return

  const payload = {
    title: newTask.value.trim(),
    imgAttachmentKey: imgAttachmentKey.value,
    ...buildLocationPayload(location.value),
  }

  if (props.editingTask) {
    emit(
      'update',
      props.editingTask.id,
      payload,
    )
  } else {
    emit('add', payload)
  }

  newTask.value = ''

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = null
  imgAttachmentKey.value = null
  showCameraCapture.value = false
  imageError.value = ''

  clearLocation()
}

function handleCancel() {
  newTask.value = ''

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = null
  imgAttachmentKey.value = null
  showCameraCapture.value = false
  imageError.value = ''

  clearLocation()

  emit('cancel')
}

async function uploadImage(file) {
  if (!file) return

  imageError.value = ''

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = URL.createObjectURL(file)
  uploading.value = true

  try {
    const response = await tasksApi.uploadImage(file)

    imgAttachmentKey.value =
      response.data.attachment_key
  } catch (err) {
    console.error(
      'Erro ao fazer upload da imagem',
      err,
    )

    previewUrl.value = null
    imgAttachmentKey.value = null

    imageError.value =
      'Não foi possível enviar a imagem.'
  } finally {
    uploading.value = false
  }
}

function handleImageChange(event) {
  uploadImage(event.target.files?.[0])
  event.target.value = ''
}

function handleCameraCapture(file) {
  showCameraCapture.value = false
  uploadImage(file)
}
</script>

<style scoped>
.task-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-width: 700px;
  margin: 0 auto 24px;
  padding: 20px 0;
}

.task-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.task-input {
  flex: 1;
  min-width: 200px;
  padding: 12px 14px;
  border: 2px solid #e2e2e2;
  border-radius: 10px;
  background: #fafafa;
  color: #333;
  font-size: 1rem;
  outline: none;
}

.task-input:focus {
  background: #fff;
  border-color: #4a90d9;
  box-shadow: 0 0 0 3px rgba(74, 144, 217, .12);
}

.task-button {
  padding: 12px 20px;
  background: #4a90d9;
  color: white;
  border: 0;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.task-button:hover:not(:disabled) {
  background: #357abd;
}

.task-button:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.task-button-cancel {
  padding: 12px 16px;
  background: transparent;
  color: #666;
  border: 2px solid #ddd;
  border-radius: 10px;
  cursor: pointer;
}

.task-button-cancel:hover {
  background: #f7f7f7;
}

.task-row > button[type='button'] {
  padding: 11px 15px;
  background: #f5f9ff;
  color: #357abd;
  border: 1px solid #c9def5;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.task-form > div:not(.task-row):not(.image-section) {
  padding: 14px 16px;
  background: #f8fbff;
  border: 1px solid #dcecff;
  border-radius: 10px;
}

.task-form > div:not(.task-row):not(.image-section) p {
  margin: 4px 0;
  color: #4a5a6a;
  font-size: .9rem;
}

.task-form > p {
  margin: 0;
  padding: 10px 14px;
  color: #b42318;
  background: #fff5f4;
  border: 1px solid #f5c2be;
  border-radius: 8px;
  font-size: .85rem;
}

.image-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.image-preview {
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
}

.image-label {
  display: flex;
  justify-content: center;
  padding: 12px;
  background: #f7f7f7;
  color: #444;
  border: 2px dashed #ccc;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.image-label:hover {
  background: #f0f6ff;
  border-color: #4a90d9;
  color: #357abd;
}

.image-input {
  display: none;
}

.upload-status {
  color: #4a90d9;
}

.image-help {
  margin: 0;
  color: #888;
  font-size: .75rem;
}

.image-error {
  margin: 0;
  padding: 8px 10px;
  color: #c0392b;
  background: #fff5f4;
  border-radius: 7px;
  font-size: .8rem;
}

.task-button-secondary {
  width: 100%;
  padding: 11px;
  background: white;
  color: #555;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.task-button-secondary:hover {
  background: #f7f7f7;
}

@media (max-width: 600px) {
  .task-form {
    padding: 16px 0;
  }

  .task-row {
    flex-direction: column;
    align-items: stretch;
  }

  .task-input,
  .task-button,
  .task-button-cancel,
  .task-row > button[type='button'] {
    width: 100%;
    min-height: 46px;
  }

  .image-preview {
    max-height: 220px;
  }
}
</style>
