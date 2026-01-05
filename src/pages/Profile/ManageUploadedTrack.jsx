import { useState } from "react";
import axios from "../../services/axios.customize";

const ManageUploadedTrack = ({ track, onUpdate, onDelete }) => {
  const [editingTrack, setEditingTrack] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    imgFile: null, // cover mới
    trackFile: null, // track mới
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openEditModal = () => {
    setEditingTrack(track);
    setEditForm({
      title: track.title || "",
      description: track.description || "",
      category: track.category || "",
      imgFile: null,
      trackFile: null,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoverChange = (e) => {
    if (e.target.files.length > 0) {
      setEditForm((prev) => ({ ...prev, imgFile: e.target.files[0] }));
    }
  };

  const handleTrackChange = (e) => {
    if (e.target.files.length > 0) {
      setEditForm((prev) => ({ ...prev, trackFile: e.target.files[0] }));
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTrack) return;
    setSaving(true);

    try {
      // --- 1. Cập nhật thông tin Text (JSON) ---
      // Backend yêu cầu JSON body cho các trường text, không nhận FormData ở endpoint này
      const res = await axios.put(`/api/songs/${editingTrack._id}`, {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
      });

      // Kiểm tra kết quả trả về (do interceptor đã trả về data)
      if (res.statusCode && res.statusCode !== 200) {
         throw new Error(res.message || "Cập nhật thông tin thất bại");
      }

      let updatedTrack = res.song || res.data || res;

      // --- 2. Cập nhật Cover (Nếu có) ---
      if (editForm.imgFile) {
        const formData = new FormData();
        formData.append("cover", editForm.imgFile);

        const resCover = await axios.post(`/api/songs/${editingTrack._id}/cover`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        if (resCover && (resCover.song || resCover.data)) {
            updatedTrack = resCover.song || resCover.data;
        }
      }

      // --- 3. Cập nhật File Nhạc (Nếu có) ---
      // Lưu ý: Nếu backend chưa có endpoint update file nhạc riêng, phần này sẽ cần xử lý thêm.
      if (editForm.trackFile) {
         console.warn("Chức năng cập nhật file nhạc chưa được hỗ trợ API.");
         alert("Lưu ý: File nhạc mới chưa được cập nhật (cần API hỗ trợ).");
      }

      onUpdate(updatedTrack);
      setEditingTrack(null);
      alert("Cập nhật thành công!");
    } catch (err) {
      console.error(err);
      alert(err?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa bài hát này?")) return;
    setDeleting(true);

    try {
      const res = await axios.delete(`/api/songs/${track._id}`);
      if (res.statusCode === 200) {
        onDelete(track._id);
        alert(res.message || "Xóa thành công!");
      } else {
        throw new Error("Xóa thất bại");
      }
    } catch (err) {
      console.error(err);
      alert(err?.message || "Xóa thất bại");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="track-actions">
        <button onClick={openEditModal} disabled={saving || deleting}>
          Edit
        </button>
        <button
          onClick={handleDelete}
          style={{ marginLeft: 8 }}
          disabled={saving || deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {editingTrack && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Track</h2>

            <label>Title</label>
            <input
              name="title"
              value={editForm.title}
              onChange={handleEditChange}
            />

            <label>Description (Artist)</label>
            <textarea
              name="description"
              value={editForm.description}
              onChange={handleEditChange}
            />

            <label>Category (Genre)</label>
            <input
              name="category"
              value={editForm.category}
              onChange={handleEditChange}
            />

            <label>Cover Image</label>
            <input type="file" accept="image/*" onChange={handleCoverChange} />

            <label>Track File (.mp3)</label>
            <input type="file" accept="audio/*" onChange={handleTrackChange} />

            <div className="modal-buttons">
              <button
                onClick={() => setEditingTrack(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageUploadedTrack;
