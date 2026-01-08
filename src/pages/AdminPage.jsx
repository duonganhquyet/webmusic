import React, { useState, useEffect } from 'react';
import { 
  Layout, Menu, Table, Card, Row, Col, Statistic, 
  Button, Avatar, Tag, Popconfirm, message, Space, 
  Modal, Form, Input, Select, Upload 
} from 'antd';
import { 
  DashboardOutlined, SoundOutlined, UserOutlined, 
  DeleteOutlined, EditOutlined, PlusOutlined, 
  LogoutOutlined, BarChartOutlined, UploadOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/auth.context';
import { fetchHomeData } from '../services/api'; 

const { Sider, Content } = Layout;
const { Option } = Select;

const API_BASE = "http://localhost:8080";

// Style cho input để không bị lỗi nền đen chữ đen
const inputStyle = { backgroundColor: '#ffffff', color: '#000000' };

const AdminPage = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useAuthContext();
  
  const [collapsed, setCollapsed] = useState(false);
  const [key, setKey] = useState('1'); 
  
  const [songs, setSongs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'SONG' hoặc 'USER'
  const [actionType, setActionType] = useState(''); // 'ADD' hoặc 'EDIT'
  const [editingItem, setEditingItem] = useState(null);
  
  // File Upload State
  const [mp3File, setMp3File] = useState(null);   
  const [coverFile, setCoverFile] = useState(null); 
  const [fileListMp3, setFileListMp3] = useState([]);
  const [fileListCover, setFileListCover] = useState([]);
  
  const [form] = Form.useForm();

  const getToken = () => localStorage.getItem("accessToken");

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  useEffect(() => {
    if (auth.user && auth.user.role !== 'admin') {
      message.error('Bạn không có quyền truy cập trang quản trị!');
      navigate('/'); 
    } else if (auth.user && auth.user.role === 'admin') {
      loadData();
    }
  }, [auth, navigate]);

  const loadData = async () => {
    setLoading(true);
    const token = getToken();

    // 1. Tải danh sách bài hát
    try {
      const res = await fetchHomeData();
      const listSongs = res.allSongs || res.songs || (res.data && res.data.allSongs) || [];
      setSongs(listSongs);
    } catch (error) {
      console.error("Lỗi tải bài hát:", error);
    }

    // 2. Tải danh sách User
    try {
      const resUser = await fetch(`${API_BASE}/api/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resUser.ok) {
        const dataUser = await resUser.json();
        const listUsers = dataUser.data || dataUser.users || [];
        setUsers(listUsers);
      }
    } catch (error) {
       console.error("Lỗi tải users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type, action, item = null) => {
    setModalType(type);
    setActionType(action);
    setEditingItem(item);
    setIsModalOpen(true);
    
    setMp3File(null);
    setCoverFile(null);
    setFileListMp3([]);
    setFileListCover([]);

    if (action === 'EDIT' && item) {
      form.setFieldsValue(item);
    } else {
      form.resetFields();
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields(); 
      const token = getToken();
      setLoading(true);

      // --- XỬ LÝ BÀI HÁT ---
      if (modalType === 'SONG') {
          if (actionType === 'ADD') {
              if (!mp3File) throw new Error("Vui lòng chọn file nhạc!");

              // B1: Upload MP3
              const formDataMp3 = new FormData();
              formDataMp3.append("files", mp3File);
              const resUpload = await fetch(`${API_BASE}/api/upload`, {
                  method: "POST",
                  headers: { "Authorization": `Bearer ${token}` },
                  body: formDataMp3
              });
              const dataUpload = await resUpload.json();
              if (!resUpload.ok) throw new Error("Lỗi upload nhạc");

              const newSongId = Array.isArray(dataUpload.data) ? dataUpload.data[0]._id : dataUpload.data._id;

              // B2: Cập nhật thông tin (Artist, Title, Category...)
              await fetch(`${API_BASE}/api/songs/${newSongId}`, {
                  method: "PUT",
                  headers: { 
                      'Content-Type': 'application/json',
                      "Authorization": `Bearer ${token}`
                  },
                  body: JSON.stringify(values)
              });

              // B3: Upload Cover
              if (coverFile) {
                  const formDataCover = new FormData();
                  formDataCover.append("cover", coverFile);
                  await fetch(`${API_BASE}/api/songs/${newSongId}/cover`, {
                      method: "POST",
                      headers: { "Authorization": `Bearer ${token}` },
                      body: formDataCover
                  });
              }
              message.success("Thêm bài hát thành công!");
          } else {
              // EDIT SONG
              await fetch(`${API_BASE}/api/songs/${editingItem._id}`, {
                  method: "PUT",
                  headers: { 
                      'Content-Type': 'application/json',
                      "Authorization": `Bearer ${token}`
                  },
                  body: JSON.stringify(values)
              });

              if (coverFile) {
                  const formDataCover = new FormData();
                  formDataCover.append("cover", coverFile);
                  await fetch(`${API_BASE}/api/songs/${editingItem._id}/cover`, {
                      method: "POST",
                      headers: { "Authorization": `Bearer ${token}` },
                      body: formDataCover
                  });
              }
              message.success("Cập nhật bài hát thành công!");
          }
      } 
      // --- XỬ LÝ USER ---
      else if (modalType === 'USER') {
          const url = actionType === 'ADD' 
              ? `${API_BASE}/api/users` 
              : `${API_BASE}/api/users/${editingItem._id}`;
          
          const method = actionType === 'ADD' ? 'POST' : 'PUT';

          if (actionType === 'EDIT' && !values.password) delete values.password;

          const res = await fetch(url, {
              method: method,
              headers: { 
                  'Content-Type': 'application/json',
                  "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify(values)
          });

          if (!res.ok) throw new Error("Lỗi xử lý user");
          message.success(actionType === 'ADD' ? "Thêm user thành công!" : "Cập nhật user thành công!");
      }

      setIsModalOpen(false);
      loadData(); 

    } catch (error) {
      console.error(error);
      message.error(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    try {
      const endpoint = type === 'song' ? 'songs' : 'users';
      const res = await fetch(`${API_BASE}/api/${endpoint}/${id}`, { 
          method: 'DELETE',
          headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if(res.ok) {
          message.success('Đã xóa thành công!');
          loadData();
      } else {
          message.error("Xóa thất bại");
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    }
  };

  const handleLogoutAdmin = () => {
      setAuth({ user: {} });
      localStorage.removeItem("accessToken");
      navigate("/");
  }

  // --- CẤU HÌNH CỘT BẢNG ---
  const songColumns = [
    { title: 'Ảnh bìa', dataIndex: 'imgUrl', render: (u) => <Avatar shape="square" size={50} src={getImageUrl(u)} /> },
    { title: 'Tên bài hát', dataIndex: 'title', width: '25%' },
    
    // ✅ THAY ĐỔI: Hiển thị trường description là Ca sĩ
    { 
      title: 'Ca sĩ', 
      dataIndex: 'description', 
      render: (text) => <b style={{color: '#1890ff'}}>{text || "Chưa cập nhật"}</b> 
    },
    
    { title: 'Thể loại', dataIndex: 'category', render: (t) => <Tag color="blue">{t || "Nhạc Trẻ"}</Tag> },
    { title: 'Thống kê', render: (_, r) => <Space><SoundOutlined />{r.countPlay} <br/><BarChartOutlined />{r.countLike}</Space> },
    {
      title: 'Hành động',
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

  const userColumns = [
    { title: 'Avatar', dataIndex: 'imgUrl', render: (u) => <Avatar src={getImageUrl(u)} /> },
    { title: 'Username', dataIndex: 'username', render: t => <b>{t}</b> },
    { title: 'Tên hiển thị', dataIndex: 'name' },
    { title: 'Vai trò', dataIndex: 'role', render: r => <Tag color={r === 'admin' ? 'red' : 'green'}>{r ? r.toUpperCase() : 'USER'}</Tag> },
    {
      title: 'Hành động',
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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="dark">
        <div style={{ height: 50, margin: 16, background: 'rgba(255, 255, 255, 0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          ADMIN PANEL
        </div>
        <Menu 
          theme="dark" defaultSelectedKeys={['1']} mode="inline" onClick={(e) => setKey(e.key)}
          items={[
            { key: '1', icon: <DashboardOutlined />, label: 'Dashboard' },
            { key: '2', icon: <SoundOutlined />, label: 'Quản lý Bài hát' },
            { key: '3', icon: <UserOutlined />, label: 'Quản lý Tài khoản' },
            { type: 'divider' },
            { key: '4', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true }
          ]}
        />
      </Sider>
      
      <Layout className="site-layout" style={{ background: '#f0f2f5' }}>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: '100%', borderRadius: 8 }}>
            
            {key === '1' && (
              <Row gutter={16}>
                  <Col span={8}><Card><Statistic title="Tổng bài hát" value={songs.length} prefix={<SoundOutlined />} /></Card></Col>
                  <Col span={8}><Card><Statistic title="Tổng thành viên" value={users.length} prefix={<UserOutlined />} /></Card></Col>
                  <Col span={8}><Card><Statistic title="Lượt nghe" value={songs.reduce((a, b) => a + (b.countPlay || 0), 0)} prefix={<BarChartOutlined />} /></Card></Col>
              </Row>
            )}

            {key === '2' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2>Danh sách bài hát</h2>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal('SONG', 'ADD')}>Thêm Bài hát</Button>
                </div>
                <Table dataSource={songs} columns={songColumns} rowKey="_id" loading={loading} />
              </>
            )}

            {key === '3' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2>Danh sách tài khoản</h2>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal('USER', 'ADD')}>Thêm User</Button>
                </div>
                <Table dataSource={users} columns={userColumns} rowKey="_id" loading={loading} />
              </>
            )}

            {key === '4' && (
               <div style={{textAlign: 'center', marginTop: 50}}>
                   <h3>Bạn có chắc chắn muốn đăng xuất?</h3>
                   <Button type="primary" danger onClick={handleLogoutAdmin}>Xác nhận Đăng xuất</Button>
               </div>
            )}

          </div>
        </Content>
      </Layout>

      {/* --- MODAL --- */}
      <Modal
        title={`${actionType === 'ADD' ? 'Thêm mới' : 'Chỉnh sửa'} ${modalType === 'SONG' ? 'Bài hát' : 'Tài khoản'}`}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText={loading ? "Đang xử lý..." : "Lưu"}
        confirmLoading={loading}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          {modalType === 'SONG' ? (
            <>
              {actionType === 'ADD' && (
                  <Form.Item label="File Nhạc (MP3)" required>
                      <Upload 
                        beforeUpload={(file) => { setMp3File(file); setFileListMp3([file]); return false; }}
                        onRemove={() => { setMp3File(null); setFileListMp3([]); }}
                        fileList={fileListMp3} 
                        maxCount={1} accept="audio/*"
                      >
                          <Button icon={<UploadOutlined />}>Chọn file nhạc</Button>
                      </Upload>
                  </Form.Item>
              )}
              <Form.Item label="Ảnh bìa (Cover)">
                  <Upload 
                    beforeUpload={(file) => { setCoverFile(file); setFileListCover([file]); return false; }}
                    onRemove={() => { setCoverFile(null); setFileListCover([]); }}
                    fileList={fileListCover}
                    maxCount={1} accept="image/*"
                  >
                      <Button icon={<UploadOutlined />}>Chọn ảnh bìa</Button>
                  </Upload>
              </Form.Item>

              <Form.Item name="title" label="Tên bài hát" rules={[{ required: true }]}>
                <Input style={inputStyle} />
              </Form.Item>
              
              {/* ✅ THAY ĐỔI: Label "Tên Ca sĩ" và map vào field "description" */}
              <Form.Item name="description" label="Tên Ca sĩ" rules={[{ required: true, message: 'Nhập tên ca sĩ' }]}>
                <Input style={inputStyle} placeholder="Ví dụ: Dương Domic" />
              </Form.Item>

              <Form.Item name="category" label="Thể loại">
                <Input style={inputStyle} placeholder="Ví dụ: RAP, POP" />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
                <Input disabled={actionType === 'EDIT'} style={inputStyle} /> 
              </Form.Item>
              <Form.Item name="name" label="Tên hiển thị" rules={[{ required: true }]}>
                <Input style={inputStyle} />
              </Form.Item>
              <Form.Item name="role" label="Phân quyền" rules={[{ required: true }]}>
                <Select style={{ width: '100%' }}>
                  <Option value="user">User</Option>
                  <Option value="admin">Admin</Option>
                </Select>
              </Form.Item>
              <Form.Item name="password" label={actionType === 'ADD' ? "Mật khẩu" : "Mật khẩu mới"} 
                rules={[{ required: actionType === 'ADD' }]}>
                <Input.Password style={inputStyle} />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminPage;