// src/components/SIdebar.jsx
import React, { useEffect, useState } from 'react';
import { List, Avatar, Typography, Space, Flex } from 'antd'; // Import giao diện Antd
import { 
  CaretRightFilled, 
  HeartFilled, 
  LoginOutlined 
} from '@ant-design/icons';

// Import hàm gọi API history (BẠN CẦN TẠO HÀM NÀY TRONG api.js)
import { fetchHistory } from '../services/api'; 
import { useAuthContext } from '../contexts/auth.context';

const { Text, Link } = Typography;

const HistoryTrack = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const {auth} = useAuthContext();

  useEffect(() => { 

    if (auth?.user?._id) {
      setIsLoggedIn(true);
      
      const getData = async () => {
        try {
          // Gọi API lấy lịch sử (Controller trả về mảng trực tiếp)
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
  }, []);

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
        <Flex vertical align="center" justify="center" style={{ padding: '20px 0', color: '#999' }}>
          <LoginOutlined style={{ fontSize: '24px', marginBottom: '8px', color: '#555' }} />
          <Text style={{ color: '#999', fontSize: '12px', textAlign: 'center' }}>
            Đăng nhập để xem lịch sử.
          </Text>
        </Flex>
      ) : (
        <List
          loading={loading}
          itemLayout="horizontal"
          dataSource={songs}
          split={false} 
          // Sửa logic render item theo dữ liệu mới từ controller
          renderItem={(item) => (
            <List.Item style={{ padding: '8px 0', border: 'none' }}>
              <Flex gap={12} align="center" style={{ width: '100%' }}>
                
                {/* Ảnh bài hát */}
                <Avatar 
                  shape="square" 
                  size={50} 
                  src={item.imgUrl} 
                  style={{ minWidth: 50, objectFit: 'cover' }} 
                />

                <Flex vertical style={{ flex: 1, overflow: 'hidden' }}>
                  {/* Tên người upload */}
                  <Text style={{ color: '#999', fontSize: '12px' }}>
                    {item.uploader?.username || "Unknown"}
                  </Text>
                  
                  {/* Tên bài hát */}
                  <Text ellipsis style={{ color: '#fff', fontSize: '13px', marginBottom: 4 }}>
                    {item.title}
                  </Text>

                  {/* Thông số play/like */}
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
