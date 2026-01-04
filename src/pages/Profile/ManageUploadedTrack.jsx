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
      const formData = new FormData();
      formData.append("title", editForm.title);
      formData.append("description", editForm.description);
      formData.append("category", editForm.category);
      if (editForm.imgFile) formData.append("cover", editForm.imgFile);
      if (editForm.trackFile) formData.append("track", editForm.trackFile);

      const res = await axios.put(`/api/songs/${editingTrack._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedTrack = res.song || res; // interceptor trả res.data trực tiếp
      if (!updatedTrack) throw new Error(res.message || "Cập nhật thất bại");

      onUpdate(updatedTrack);
      setEditingTrack(null);
      alert(res.message || "Cập nhật thành công!");
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
