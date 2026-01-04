import axios from "./axios.customize";

// QUAN TRỌNG: Định nghĩa địa chỉ Server Backend
const BASE_URL = "http://localhost:8080";

/* =========================================
   1. CÁC HÀM GET DỮ LIỆU
   ========================================= */

export const fetchHomeData = () => {
    // SỬA: Thêm BASE_URL
    return axios.get(`${BASE_URL}/api/songs/home`);  
};

export const fetchSongById = (id) => {
    return axios.get(`${BASE_URL}/api/song/${id}`);
};

export const fetchCommentById = (id) => {
    const urlBackend =  `/api/comments/${id}`;
    return axios.get(urlBackend);
};

/* =========================================
   2. CÁC HÀM MỚI (UPLOAD & SEARCH)
   ========================================= */

export const searchSongs = (query) => {
    return axios.get(`${BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
};

export const uploadSongFile = (formData) => {
    return axios.post(`${BASE_URL}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const updateSongInfo = (id, data) => {
    return axios.put(`${BASE_URL}/api/songs/${id}`, data);
};

export const uploadSongCover = (id, formData) => {
    return axios.post(`${BASE_URL}/api/songs/${id}/cover`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
  
};

export const fetchHistory = async () => {
    try {
        // Giả sử bạn đã cấu hình axios để tự động gửi Header Authorization
        const response = await axios.get('/api/history/get-history'); 
        return response.data;
    } catch (error) {
        console.error("Error fetching history:", error);
        return [];
    }
};
export const fetchSongsByUser = async (userId) => {
  const res = await axios.get(`/api/users/${userId}/songs`);
  // res lúc này === { songs: [...] }
  return res.songs || [];
};