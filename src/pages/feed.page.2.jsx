import React from 'react';
import { 
  Avatar, Button, Col, Flex, Row, Space, Typography, Card, Image 
} from "antd";
import {
  CaretRightOutlined, HeartFilled, RetweetOutlined, ShareAltOutlined,
  PlusSquareOutlined, MoreOutlined, PlaySquareOutlined, CommentOutlined
} from '@ant-design/icons';

import Container from "../components/container"; 
import ListeningHistory from '../components/historyTrack';

const { Text } = Typography;

// --- 1. Component Thẻ Bài Hát (SoundCloudTrack) ---
const SoundCloudTrack = () => {
  // Dữ liệu giả lập & URL ảnh
  const AVATAR_URL = "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png";
  const TRACK_ART_URL = "https://picsum.photos/150"; 
  const WAVEFORM_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Waveform.png/800px-Waveform.png"; 

  // Style chung cho nút
  const actionButtonStyle = { color: 'white', fontSize: '14px' };
  const secondaryActionStyle = { color: '#a0a0a0', fontSize: '14px' };
  const statTextStyle = { color: '#a0a0a0', fontSize: '12px' };

  return (
    <Card
      style={{
        width: '100%',
        backgroundColor: '#1c1c1c',
        border: '1px solid #333',
        color: 'white'
      }}
      bodyStyle={{ padding: '20px' }}
    >
      {/* Header: User info */}
      <Space align="center" style={{ marginBottom: 16 }}>
        <Avatar src={AVATAR_URL} />
        <Text style={{ color: '#a0a0a0' }}>
          Nguyễn Hưng posted a track 4 months ago
        </Text>
      </Space>

      {/* Body: Player */}
      <Flex gap={16} align="flex-start">
        <Image 
          width={120} height={120} 
          src={TRACK_ART_URL} 
          style={{ borderRadius: '4px' }}
          preview={false}
        />
        
        <Flex vertical style={{ width: '100%', overflow: 'hidden' }}>
          <Flex align="center" gap={12}>
            <Button 
              type="primary" shape="circle" icon={<CaretRightOutlined />} size="large"
              style={{ backgroundColor: '#f50', border: 'none' }} 
            />
            <Space direction="vertical" size={0} style={{width: '100%'}}>
              <Text style={{ color: '#a0a0a0', fontSize: '14px' }}>Nguyễn Hưng</Text>
              <Text ellipsis style={{ color: 'white', fontSize: '16px', fontWeight: '500', maxWidth: '100%' }}>
                Tiếng đàn ta lư * 9 am Cre:Toptop
              </Text>
            </Space>
          </Flex>

          {/* Waveform giả lập */}
          <div style={{ marginTop: 12, width: '100%', height: 50, position: 'relative', background: '#333' }}>
             {/* Ở đây dùng tạm div màu xám thay cho ảnh sóng âm để demo layout */}
             <img src={WAVEFORM_URL} style={{width: '100%', height: '100%', opacity: 0.5, objectFit: 'cover'}} alt="wave" />
             <Text style={{ position: 'absolute', right: 4, bottom: 2, color: 'white', background: 'rgba(0,0,0,0.6)', fontSize: '10px', padding: '0 4px' }}>3:13</Text>
          </div>
        </Flex>
      </Flex>

      {/* Footer: Actions */}
      <Flex justify="space-between" align="center" style={{ marginTop: 16, borderTop: '1px solid #333', paddingTop: 12 }}>
        <Space size="small">
          <Button type="text" icon={<HeartFilled style={{ color: 'white' }} />} style={actionButtonStyle}>3,994</Button>
          <Button type="text" icon={<RetweetOutlined />} style={actionButtonStyle}>91</Button>
          <Button type="text" icon={<ShareAltOutlined />} style={secondaryActionStyle} />
          <Button type="text" icon={<PlusSquareOutlined />} style={secondaryActionStyle} />
        </Space>
        <Space size="large">
          <Text style={statTextStyle}><PlaySquareOutlined style={{ marginRight: 4 }} /> 255K</Text>
          <Text style={statTextStyle}><CommentOutlined style={{ marginRight: 4 }} /> 80</Text>
        </Space>
      </Flex>
    </Card>
  );
};

// --- 2. Page Chính (Code của bạn đã chỉnh sửa) ---
const PageFeed2 = () => {
  return (
    <div>
      <Container>
        
        <Row gutter={16}>
          <Col className="gutter-row" span={16}>
            <div>
              <p style={{ fontSize: 26, fontWeight: 600, marginBottom: 20 }}>
                Hear the latest posts from the people you’re following
              </p>
            </div>

            {/* Khu vực hiển thị danh sách bài hát */}
            <div style={{
              background: "#ccc", 
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              padding: "20px", 
              gap: "20px"      
            }}>
              
              {/* --- Chèn component vào đây --- */}
              <SoundCloudTrack />
              
              {/* Tôi thêm cái thứ 2 để bạn thấy layout danh sách trông thế nào */}
              <SoundCloudTrack /> 

            </div>
          </Col>

          <Col className="gutter-row" span={8}>
            <div style={{ background: "#ccc", height: '100%' }}>
               {/* Sidebar nội dung */}
               <div style={{padding: 20}}><ListeningHistory/></div>
            </div>
          </Col>
        </Row>

      </Container>
    </div>
  );
}

export default PageFeed2;