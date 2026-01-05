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
  const [modalType, setModalType] = useState(''); 
  const [actionType, setActionType] = useState(''); 
  const [editingItem, setEditingItem] = useState(null);
  
  // --- STATE FILE UPLOAD ---
  const [mp3File, setMp3File] = useState(null);   
  const [coverFile, setCoverFile] = useState(null); 
  // State quản lý danh sách file trên UI (để hiển thị tên file)
  const [fileListMp3, setFileListMp3] = useState([]);
  const [fileListCover, setFileListCover] = useState([]);
  
  const [form] = Form.useForm();

  // ✅ Hàm lấy Token từ LocalStorage
  const getToken = () => localStorage.getItem("accessToken");

  // Hàm xử lý link ảnh
  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // CHECK QUYỀN
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
    try {
      const res = await fetchHomeData();
      const listSongs = res.allSongs || res.songs || (res.data && res.data.allSongs) || [];
      setSongs(listSongs);
      
      // ✅ THÊM HEADER AUTH VÀO ĐÂY
      const resUser = await fetch(`${API_BASE}/api/users`, {
        headers: {
            "Authorization": `Bearer ${getToken()}`
        }
      });
      if (resUser.ok) {
        const dataUser = await resUser.json();
        setUsers(dataUser.data || dataUser.users || []);
      } 
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // MỞ MODAL
  const handleOpenModal = (type, action, item = null) => {
    setModalType(type);
    setActionType(action);
    setEditingItem(item);
    setIsModalOpen(true);
    
    // Reset file mỗi khi mở modal
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

  // --- XỬ LÝ LOGIC LƯU ---
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields(); 
      const token = getToken(); // Lấy token

      // KIỂM TRA FILE MP3
      if (modalType === 'SONG' && actionType === 'ADD' && !mp3File) {
          return message.error("Vui lòng chọn file nhạc (MP3)!");
      }

      setLoading(true);

      // === TRƯỜNG HỢP 1: THÊM MỚI BÀI HÁT ===
      if (modalType === 'SONG' && actionType === 'ADD') {
          
          // BƯỚC 1: Upload MP3 (FormData -> KHÔNG set Content-Type thủ công)
          const formDataMp3 = new FormData();
          formDataMp3.append("files", mp3File); 

          const resUpload = await fetch(`${API_BASE}/api/upload`, {
              method: "POST",
              headers: { 
                  "Authorization": `Bearer ${token}` 
              },
              body: formDataMp3
          });
          const dataUpload = await resUpload.json();
          if (!resUpload.ok) throw new Error(dataUpload.message || "Lỗi upload nhạc");

          // Lấy ID bài hát
          const newSong = Array.isArray(dataUpload.data) ? dataUpload.data[0] : dataUpload.data;
          const newSongId = newSong._id;

          // BƯỚC 2: Cập nhật thông tin (JSON -> CẦN Content-Type)
          await fetch(`${API_BASE}/api/songs/${newSongId}`, {
              method: "PUT",
              headers: { 
                  'Content-Type': 'application/json',
                  "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify(values)
          });

          // BƯỚC 3: Upload ảnh bìa
          if (coverFile) {
              const formDataCover = new FormData();
              formDataCover.append("cover", coverFile);
              await fetch(`${API_BASE}/api/songs/${newSongId}/cover`, {
                  method: "POST",
                  headers: { "Authorization": `Bearer ${token}` },
                  body: formDataCover
              });
          }

          message.success("Thêm bài hát mới thành công!");

      } 
      // === TRƯỜNG HỢP 2: CÁC TRƯỜNG HỢP KHÁC ===
      else {
          let url = `${API_BASE}/api/${modalType === 'SONG' ? 'songs' : 'users'}`;
          let method = actionType === 'ADD' ? 'POST' : 'PUT';
          
          if (actionType === 'EDIT') url += `/${editingItem._id}`;

          const res = await fetch(url, {
              method: method,
              headers: { 
                  'Content-Type': 'application/json',
                  "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify(values)
          });
          
          if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.message || "Lỗi thao tác");
          }

          // Upload ảnh bìa mới khi sửa bài hát
          if (modalType === 'SONG' && actionType === 'EDIT' && coverFile) {
              const formDataCover = new FormData();
              formDataCover.append("cover", coverFile);
              await fetch(`${API_BASE}/api/songs/${editingItem._id}/cover`, {
                  method: "POST",
                  headers: { "Authorization": `Bearer ${token}` },
                  body: formDataCover
              });
          }
          message.success("Cập nhật thành công!");
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
      // ✅ THÊM HEADER AUTH VÀO ĐÂY
      await fetch(`${API_BASE}/api/${endpoint}/${id}`, { 
          method: 'DELETE',
          headers: { "Authorization": `Bearer ${getToken()}` }
      });
      message.success('Đã xóa thành công!');
      loadData();
    } catch (error) {
      message.error("Xóa thất bại");
    }
  };

  const handleLogoutAdmin = () => {
      setAuth({ user: {} });
      localStorage.removeItem("accessToken");
      navigate("/");
  }

  // --- COLUMN DEFINITIONS ---
  const songColumns = [
    { title: 'Cover', dataIndex: 'imgUrl', render: (u) => <Avatar shape="square" size={50} src={getImageUrl(u)} /> },
    { title: 'Title', dataIndex: 'title', width: '25%' },
    { title: 'Artist', render: (_, r) => (r.uploader && r.uploader.name) ? r.uploader.name : (r.description || "Unknown") },
    { title: 'Stats', render: (_, r) => <Space><SoundOutlined />{r.countPlay} <br/><BarChartOutlined />{r.countLike}</Space> },
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

  const userColumns = [
    { title: 'Avatar', dataIndex: 'imgUrl', render: (u) => <Avatar src={getImageUrl(u)} /> },
    { title: 'Username', dataIndex: 'username', render: t => <b>{t}</b> },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Role', dataIndex: 'role', render: r => <Tag color={r === 'admin' ? 'red' : 'green'}>{r ? r.toUpperCase() : 'USER'}</Tag> },
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
              {/* --- PHẦN UPLOAD FILE ĐÃ SỬA UI --- */}
              {actionType === 'ADD' && (
                  <Form.Item label="File Nhạc (MP3)" required>
                      <Upload 
                        beforeUpload={(file) => { 
                            setMp3File(file); 
                            setFileListMp3([file]); // Cập nhật UI list
                            return false; 
                        }}
                        onRemove={() => { 
                            setMp3File(null); 
                            setFileListMp3([]); 
                        }}
                        fileList={fileListMp3} // Gắn list file vào UI
                        maxCount={1} accept="audio/*"
                      >
                          <Button icon={<UploadOutlined />}>Chọn file nhạc</Button>
                      </Upload>
                  </Form.Item>
              )}

              <Form.Item label="Ảnh bìa (Cover)">
                  <Upload 
                    beforeUpload={(file) => { 
                        setCoverFile(file); 
                        setFileListCover([file]); 
                        return false; 
                    }}
                    onRemove={() => { 
                        setCoverFile(null); 
                        setFileListCover([]); 
                    }}
                    fileList={fileListCover}
                    maxCount={1} accept="image/*"
                  >
                      <Button icon={<UploadOutlined />}>Chọn ảnh bìa</Button>
                  </Upload>
              </Form.Item>
              {/* ----------------------------- */}

              <Form.Item name="title" label="Tên bài hát" rules={[{ required: true, message: 'Nhập tên bài hát' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Nghệ sĩ / Mô tả">
                <Input />
              </Form.Item>
              <Form.Item name="category" label="Thể loại">
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