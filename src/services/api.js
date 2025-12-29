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
<<<<<<< HEAD
    // SỬA: Trước đây bạn viết "/api//comments" (thừa 1 dấu /)
    return axios.get(`${BASE_URL}/api/comments/${id}`);
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
=======
    const urlBackend =  `/api/comments/${id}`;
    return axios.get(urlBackend);
>>>>>>> 872cc1932cd6893594de66e181cc5264b61c8988
};