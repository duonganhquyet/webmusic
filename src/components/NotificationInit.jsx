// src/components/NotificationInit.jsx
import { useEffect } from 'react';
import { notification } from 'antd';
import { setNotificationInstance } from '../utils/notification';

const NotificationInit = () => {
  const [api, contextHolder] = notification.useNotification();

  // Khi component được mount, gán api vào biến global
  useEffect(() => {
    setNotificationInstance(api);
  }, [api]);

  // Trả về contextHolder để render ra giao diện thông báo
  return <>{contextHolder}</>;
};

export default NotificationInit;