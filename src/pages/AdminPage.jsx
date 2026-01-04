import React, { useState, useEffect } from 'react';
import { 
  Layout, Menu, Table, Card, Row, Col, Statistic, 
  Button, Avatar, Tag, Popconfirm, message, Space, 
  Modal, Form, Input, Select, Drawer 
} from 'antd';
import { 
  DashboardOutlined, SoundOutlined, UserOutlined, 
  DeleteOutlined, EditOutlined, PlusOutlined, 
  LogoutOutlined, BarChartOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fetchHomeData } from '../services/api'; 

const { Sider, Content } = Layout;
const { Option } = Select;

// --- GIẢ LẬP API (Bạn thay bằng gọi API thật) ---
// const apiCall = (url, method, data) => axios(...)
const mockApiDelay = () => new Promise(resolve => setTimeout(resolve, 500));

const AdminPage = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [key, setKey] = useState('1'); // 1: Dashboard, 2: Songs, 3: Users
  
  // Data State
  const [songs, setSongs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State (Dùng chung cho cả Add và Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'SONG' hoặc 'USER'
  const [actionType, setActionType] = useState(''); // 'ADD' hoặc 'EDIT'
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  // 1. CHECK QUYỀN ADMIN KHI VÀO TRANG
  useEffect(() => {
    // Giả sử thông tin user lưu trong localStorage
    const userStr = localStorage.getItem('user'); 
    const currentUser = userStr ? JSON.parse(userStr) : null;

    if (!currentUser || currentUser.role !== 'admin') {
      message.error('Bạn không có quyền truy cập trang này!');
      navigate('/'); // Đá về trang chủ
    } else {
      loadData();
    }
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchHomeData();
      setSongs(res.allSongs || res.songs || []);
      
      // Giả lập Users (Thay bằng API fetch users thật)
      setUsers([
        { _id: 'u1', username: 'admin', name: 'Super Admin', role: 'admin', imgUrl: '' },
        { _id: 'u2', username: 'denvau', name: 'Đen Vâu', role: 'user', imgUrl: '' },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- XỬ LÝ FORM (THÊM / SỬA) ---
  const handleOpenModal = (type, action, item = null) => {
    setModalType(type);
    setActionType(action);
    setEditingItem(item);
    setIsModalOpen(true);
    
    // Nếu là sửa, fill dữ liệu vào form
    if (action === 'EDIT' && item) {
      form.setFieldsValue(item);
    } else {
      form.resetFields();
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      console.log(`Đang ${actionType} ${modalType}:`, values);
      
      // GỌI API TƯƠNG ỨNG TẠI ĐÂY
      await mockApiDelay(); // Giả lập chờ API
      
      message.success(`${actionType === 'ADD' ? 'Thêm' : 'Cập nhật'} thành công!`);
      setIsModalOpen(false);
      loadData(); // Load lại bảng
    } catch (error) {
      message.error("Có lỗi xảy ra, vui lòng kiểm tra lại form");
    } finally {
      setLoading(false);
    }
  };

  // --- XỬ LÝ XÓA ---
  const handleDelete = async (id, type) => {
    try {
      // await axios.delete(`/api/${type}s/${id}`);
      await mockApiDelay();
      message.success('Đã xóa thành công!');
      loadData();
    } catch (error) {
      message.error('Xóa thất bại');
    }
  };

  // --- CẤU HÌNH CỘT CHO BẢNG SONGS ---
  const songColumns = [
    { title: 'Cover', dataIndex: 'imgUrl', render: u => <Avatar shape="square" src={u} /> },
    { title: 'Title', dataIndex: 'title', width: '30%' },
    { title: 'Artist', render: (_, r) => r.uploader?.name || r.description || "Unknown" },
    { 
      title: 'Stats', 
      render: (_, r) => <Space><SoundOutlined />{r.countPlay} <br/><BarChartOutlined />{r.countLike}</Space> 
    },
    {
      title: 'Action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleOpenModal('SONG', 'EDIT', record)} />
          <Popconfirm title="Xóa bài hát này?" onConfirm={() => handleDelete(record._id, 'song')}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // --- CẤU HÌNH CỘT CHO BẢNG USERS ---
  const userColumns = [
    { title: 'Username', dataIndex: 'username', render: t => <b>{t}</b> },
    { title: 'Name', dataIndex: 'name' },
    { 
      title: 'Role', 
      dataIndex: 'role', 
      render: r => <Tag color={r === 'admin' ? 'red' : 'green'}>{r.toUpperCase()}</Tag> 
    },
    {
      title: 'Action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleOpenModal('USER', 'EDIT', record)} />
          <Popconfirm title="Xóa user này?" onConfirm={() => handleDelete(record._id, 'user')}>
            <Button danger icon={<DeleteOutlined />} disabled={record.role === 'admin'} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    // Layout fullscreen riêng biệt, nền tối nhẹ cho Sidebar
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="dark">
        <div style={{ height: 50, margin: 16, background: 'rgba(255, 255, 255, 0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          ADMIN PANEL
        </div>
        <Menu 
          theme="dark" 
          defaultSelectedKeys={['1']} 
          mode="inline"
          onClick={(e) => setKey(e.key)}
          items={[
            { key: '1', icon: <DashboardOutlined />, label: 'Dashboard' },
            { key: '2', icon: <SoundOutlined />, label: 'Quản lý Bài hát' },
            { key: '3', icon: <UserOutlined />, label: 'Quản lý Tài khoản' },
            { type: 'divider' },
            { key: '4', icon: <LogoutOutlined />, label: 'Thoát Admin', danger: true }
          ]}
        />
      </Sider>
      
      <Layout className="site-layout" style={{ background: '#f0f2f5' }}>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: '100%', borderRadius: 8 }}>
            
            {/* 1. DASHBOARD */}
            {key === '1' && (
              <>
                <h2>Thống kê tổng quan</h2>
                <Row gutter={16} style={{ marginTop: 20 }}>
                  <Col span={8}><Card><Statistic title="Tổng bài hát" value={songs.length} prefix={<SoundOutlined />} /></Card></Col>
                  <Col span={8}><Card><Statistic title="Tổng thành viên" value={users.length} prefix={<UserOutlined />} /></Card></Col>
                  <Col span={8}><Card><Statistic title="Tổng lượt nghe" value={songs.reduce((a, b) => a + (b.countPlay || 0), 0)} prefix={<BarChartOutlined />} /></Card></Col>
                </Row>
              </>
            )}

            {/* 2. SONG MANAGER */}
            {key === '2' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2>Danh sách bài hát</h2>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal('SONG', 'ADD')}>Thêm bài hát</Button>
                </div>
                <Table dataSource={songs} columns={songColumns} rowKey="_id" loading={loading} />
              </>
            )}

            {/* 3. USER MANAGER */}
            {key === '3' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2>Danh sách tài khoản</h2>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal('USER', 'ADD')}>Thêm User</Button>
                </div>
                <Table dataSource={users} columns={userColumns} rowKey="_id" loading={loading} />
              </>
            )}

            {/* 4. LOGOUT LOGIC */}
            {key === '4' && (() => {
               navigate('/'); 
               return null; 
            })()}

          </div>
        </Content>
      </Layout>

      {/* --- MODAL CHUNG CHO ADD/EDIT --- */}
      <Modal
        title={`${actionType === 'ADD' ? 'Thêm mới' : 'Chỉnh sửa'} ${modalType === 'SONG' ? 'Bài hát' : 'Tài khoản'}`}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          {modalType === 'SONG' ? (
            <>
              <Form.Item name="title" label="Tên bài hát" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Nghệ sĩ / Mô tả">
                <Input />
              </Form.Item>
              <Form.Item name="imgUrl" label="Link Ảnh bìa">
                <Input />
              </Form.Item>
              <Form.Item name="trackUrl" label="Link Nhạc (MP3)">
                <Input />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
                <Input disabled={actionType === 'EDIT'} /> 
              </Form.Item>
              <Form.Item name="name" label="Tên hiển thị">
                <Input />
              </Form.Item>
              <Form.Item name="role" label="Phân quyền" rules={[{ required: true }]}>
                <Select>
                  <Option value="user">User</Option>
                  <Option value="admin">Admin</Option>
                </Select>
              </Form.Item>
              {actionType === 'ADD' && (
                 <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
                   <Input.Password />
                 </Form.Item>
              )}
            </>
          )}
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminPage;