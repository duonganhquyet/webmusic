// src/components/SIdebar.jsx
import React, { useEffect, useState } from 'react';
import { List, Avatar, Typography, Space, Flex } from 'antd'; // Import giao diện Antd
import { 
  CaretRightFilled, 
  HeartFilled, 
  RetweetOutlined, 
  MessageFilled 
} from '@ant-design/icons';

// QUAN TRỌNG: Import hàm gọi API từ file api.js, KHÔNG dùng axios trực tiếp ở đây
import { fetchHomeData } from '../services/api'; 

const { Text, Link } = Typography;

const Sidebar = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        // Gọi hàm từ file api.js
        const result = await fetchHomeData();
        // Lấy topSongs để hiển thị làm lịch sử (hoặc allSongs tùy bạn)
        if (result && result.topSongs) {
          setSongs(result.topSongs);
        }
      } catch (error) {
        console.error("Lỗi tải Sidebar:", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  return (
    <div style={{ width: '100%', paddingLeft: '20px', borderLeft: '1px solid #333' }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #333' }}>
        <Text strong style={{ textTransform: 'uppercase', fontSize: '12px', color: '#fff' }}>
          Listening History
        </Text>
        <Link style={{ color: '#999', fontSize: '12px' }}>View all</Link>
      </Flex>

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
                style={{ minWidth: 50 }} 
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
                    <CaretRightFilled style={{ fontSize: '10px' }} /> {item.countPlay}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <HeartFilled style={{ fontSize: '10px' }} /> {item.countLike}
                  </span>
                </Space>
              </Flex>

            </Flex>
          </List.Item>
        )}
      />
    </div>
  );
};

export default Sidebar;