// src/utils/notification.js

// Biến này sẽ giữ instance của notification
let notificationApi = null;

// Hàm này được gọi 1 lần duy nhất ở App.js để gán instance
export const setNotificationInstance = (api) => {
  notificationApi = api;
};

// Hàm thông báo thành công (Dùng cái này cho các file khác)
export const notifySuccess = (title, message) => {
  if (notificationApi) {
    notificationApi.success({
      message: title,
      description: message,
      placement: 'topRight', // Vị trí hiển thị
    });
  }
};

// Hàm thông báo lỗi
export const notifyError = (title, message) => {
  if (notificationApi) {
    notificationApi.error({
      message: title,
      description: message,
      placement: 'topRight',
    });
  }
};

// Hàm thông báo cảnh báo
export const notifyWarning = (title, message) => {
  if (notificationApi) {
    notificationApi.warning({
      message: title,
      description: message,
      placement: 'topRight',
    });
  }
};

// Generic open to support custom actions (e.g., Undo buttons)
export const notifyOpen = (options) => {
  if (notificationApi) {
    notificationApi.open(options);
  }
};

// Destroy a notification by key
export const notifyDestroy = (key) => {
  if (notificationApi && key) {
    notificationApi.destroy(key);
  }
};