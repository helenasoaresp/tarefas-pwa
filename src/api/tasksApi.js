import apiClient from './config.js';

const LOCATION_FIELDS = [
  'latitude',
  'longitude',
  'geolocation_accuracy',
  'geolocation_timestamp',
  'location_label',
];

const tasksApi = {
  getAll() {
    return apiClient.get('/tasks');
  },

  create(input = {}) {
    const task = typeof input === 'string' ? { title: input } : input;
    const payload = { title: task.title };

    if (task.imgAttachmentKey != null) {
      payload.img_attachment_key = task.imgAttachmentKey;
    }

    for (const field of LOCATION_FIELDS) {
      payload[field] = task[field] ?? null;
    }

    return apiClient.post('/tasks', payload);
  },

  update(id, data) {
    return apiClient.patch(`/tasks/${id}`, data);
  },

  remove(id) {
    return apiClient.delete(`/tasks/${id}`);
  },

  uploadImage(file, description = '') {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    return apiClient.post('/uploads/images/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default tasksApi;
