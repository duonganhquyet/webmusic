// src/services/api.js
import axios from "./axios.customize";

export const fetchHomeData = () => {
    return axios.get(`/api/songs/home`);  
};

export const fetchSongById = (id) => {
    const urlBackend = `/api/song/${id}`;
    return axios.get(urlBackend);
}

export const fetchCommentById = (id) => {
    const urlBackend = `/api/comments/${id}`;
    return axios.get(urlBackend);
};

export const checkUsername = (username) => {
    const urlBackend =  `/api/check-username`;
    return axios.get(urlBackend,{
        params: {username}
    });
}

export const registerUser = (username, password, fullName) => {
    const urlBackend = "/api/register";
    return axios.post(urlBackend, {
        username,
        password,
        name: fullName
    });
}

export const loginUser = (username, password) => {
    const urlBackend = "/api/login";
    return axios.post(urlBackend, {
        username,
        password
    })
}

export const checkSession = () => {
    const urlBackend = "/api/me";
    return axios.get(urlBackend);
}

export const postCommentAPI = (userId,trackId, content, moment) => {
    const urlBackend = "/api/comments";
    return axios.post(urlBackend, {
        userId,
        trackId,
        content,
        moment
    });
}

export const fetchDataGeneralPanel = () => {
    const urlBackend = "/api/user/stats";
    return axios.get(urlBackend);
}

export const fetchDataLikePanel = () => {
    const urlBackend = "/api/user/likes";
    return axios.get(urlBackend);
}
export const dislikeSongAPI = (songId) => {
    const urlBackend = `/api/song/${songId}/like`;
    return axios.delete(urlBackend);
}
export const likeSongAPI = (songId) => {
    const urlBackend = `/api/song/${songId}/like`;
    return axios.post(urlBackend);
}

export const fetchUserPlaylists = () => {
    const urlBackend = "/api/user/playlists";
    return axios.get(urlBackend);
}

export const createUserPlaylist = (payload) => {
    const urlBackend = "/api/library/playlists";
    return axios.post(urlBackend, payload);
}

export const fetchPlaylistTracks = (playlistID) => {
    const urlBackend = `/api/library/playlists/${playlistID}/tracks`;
    return axios.get(urlBackend);
}

export const fetchFollowingArtists = () => {
    const urlBackend = `/api/follow/following`;
    return axios.get(urlBackend);
}

export const fetchUserHistory = () => {
    const urlBackend = `/api/user/history`;
    return axios.get(urlBackend);
}

export const clearUserHistory = () => {
    const urlBackend = `/api/history/clear`;
    return axios.delete(urlBackend);
}

/* =========================================
   2. CÁC HÀM MỚI (UPLOAD & SEARCH)
   ========================================= */

export const searchSongs = (query) => {
    return axios.get(`/api/search?q=${encodeURIComponent(query)}`);
};

export const uploadSongFile = (formData) => {
    return axios.post(`/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const updateSongInfo = (id, data) => {
    return axios.put(`/api/songs/${id}`, data);
};

export const uploadSongCover = (id, formData) => {
    return axios.post(`/api/songs/${id}/cover`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};


export const fetchSongsByUser = async (userId) => {
  const res = await axios.get(`/api/users/${userId}/songs`);
  return res.songs || [];
};

export const fetchHistory = async (token) => {
    try {
        const response = await axios.get('/api/history', {
            headers: {
                // Gắn token vào đây thì server mới nhận diện được
                Authorization: `Bearer ${token}` 
            }
        });
        return response; 
    } catch (error) {
        console.error("Error fetching history:", error);
        return [];
    }
};

// 2. Hàm lưu lịch sử - Có log để debug
export const saveToHistory = (songId, token) => {
    console.log("API Save History - SongID:", songId, "- Token:", token ? "Có" : "Không");
    
    return axios.post('/api/history', { songId }, {
        headers: {
            Authorization: `Bearer ${token}` // Ép cứng token vào đây
        }
    });
}