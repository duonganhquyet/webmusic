// src/components/Sidebar.jsx (hoặc HistoryTrack.jsx)
import React, { useEffect, useState } from 'react';
import { List, Avatar, Typography, Space, Flex } from 'antd'; 
import { 
  CaretRightFilled, 
  HeartFilled, 
  LoginOutlined 
} from '@ant-design/icons';
import { fetchHistory } from '../services/api'; 
import { useAuthContext } from '../contexts/auth.context';

const { Text, Link } = Typography;

// --- 1. TẠO COMPONENT SÓNG NHẠC ĐỘNG (CSS thuần) ---
const MusicWave = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height: '20px', gap: '3px', marginTop: '10px' }}>
      {/* 4 thanh sóng nhạc với độ trễ (delay) khác nhau để tạo hiệu ứng nhấp nhô */}
      {['0s', '0.2s', '0.4s', '0.1s'].map((delay, index) => (
        <div 
          key={index}
          style={{
            width: '4px',
            backgroundColor: '#1890ff', // Màu xanh chủ đạo (có thể đổi thành màu khác)
            animation: `music-wave 1s infinite ease-in-out`,
            animationDelay: delay,
            borderRadius: '2px'
          }}
        />
      ))}
      
      {/* Định nghĩa Keyframes ngay trong component */}
      <style>{`
        @keyframes music-wave {
          0%, 100% { height: 3px; opacity: 0.5; }
          50% { height: 15px; opacity: 1; }
        }
      `}</style>
    </div>
  );
};
// ----------------------------------------------------

const HistoryTrack = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const {auth} = useAuthContext();
  const token = localStorage.getItem("accessToken"); // Lấy token để gọi API

  useEffect(() => { 
    if (auth?.user?._id) {
      setIsLoggedIn(true);
      const getData = async () => {
        try {
          const result = await fetchHistory(token); 
          if (Array.isArray(result)) {
            setSongs(result);
          }
        } catch (error) {
          console.error("Lỗi tải historyTrack:", error);
        } finally {
          setLoading(false);
        }
      };
      getData();
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, [auth, token]); // Thêm token vào dependency

  return (
    <div style={{ width: '100%', paddingLeft: '20px', borderLeft: '1px solid #333' }}>
      
      {/* Header */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #333' }}>
        <Text strong style={{ textTransform: 'uppercase', fontSize: '12px', color: '#fff' }}>
          Listening History
        </Text>
        {isLoggedIn && <Link style={{ color: '#999', fontSize: '12px' }}>View all</Link>}
      </Flex>

      {/* Nội dung */}
      {!isLoggedIn ? (
        <Flex vertical align="center" justify="center" style={{ padding: '30px 0', color: '#999' }}>
          
          <LoginOutlined style={{ fontSize: '24px', marginBottom: '8px', color: '#555' }} />
          
          <Text style={{ color: '#999', fontSize: '12px', textAlign: 'center' }}>
            Đăng nhập để xem lịch sử.
          </Text>

          {/* --- 2. CHÈN ICON ĐỘNG VÀO ĐÂY --- */}
          <MusicWave /> 

        </Flex>
      ) : (
        <List
          loading={loading}
          itemLayout="horizontal"
          dataSource={songs}
          split={false} 
          renderItem={(item) => (
            <List.Item style={{ padding: '8px 0', border: 'none' }}>
              <Flex gap={12} align="center" style={{ width: '100%' }}>
                
                <Avatar 
                  shape="square" 
                  size={50} 
                  src={item.imgUrl} 
                  style={{ minWidth: 50, objectFit: 'cover' }} 
                />

                <Flex vertical style={{ flex: 1, overflow: 'hidden' }}>
                  <Text style={{ color: '#999', fontSize: '12px' }}>
                    {item.uploader?.username || "Unknown"}
                  </Text>
                  
                  <Text ellipsis style={{ color: '#fff', fontSize: '13px', marginBottom: 4 }}>
                    {item.title}
                  </Text>

                  <Space size={12} style={{ fontSize: '11px', color: '#999' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CaretRightFilled style={{ fontSize: '10px' }} /> {item.countPlay?.toLocaleString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <HeartFilled style={{ fontSize: '10px' }} /> {item.countLike?.toLocaleString()}
                    </span>
                  </Space>
                </Flex>

              </Flex>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default HistoryTrack;