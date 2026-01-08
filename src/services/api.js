import axios from "./axios.customize";

export const fetchHomeData = () => {
    // SỬA: Thêm BASE_URL
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
    // Send JSON object; axios sets proper Content-Type
    return axios.post(urlBackend, payload);
}

export const fetchPlaylistTracks = (playlistID) => {
    const urlBackend = `/api/library/playlists/${playlistID}/tracks`;
    return axios.get(urlBackend);
}

export const addTrackToPlaylist = (playlistID, trackID) => {
    // Backend should handle pushing the track into playlist.tracks
    return axios.post(`/api/library/playlists/${playlistID}/tracks`, { trackId: trackID });
}

export const uploadPlaylistCover = (playlistID, formData) => {
    return axios.post(`/api/library/playlists/${playlistID}/cover`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}

export const updatePlaylistInfo = (playlistID, data) => {
    return axios.put(`/api/library/playlists/${playlistID}`, data);
}

export const deletePlaylist = (playlistID) => {
    return axios.delete(`/api/library/playlists/${playlistID}`);
}

export const fetchFollowingArtists = () => {
    const urlBackend = `/api/follow/following`;
    return axios.get(urlBackend);
}

// Lấy followers của một user
export const fetchFollowers = (userId) => {
  return axios.get(`/api/follow/followers/${userId}`); // trả array trực tiếp
};

// Lấy following của một user
export const fetchFollowing = (userId) => {
  return axios.get(`/api/follow/following/${userId}`); // trả { following, count }
};

// check trạng thái follow
export const checkFollowStatus = (targetUserId) => {
  return axios.get(`/api/follow/status/${targetUserId}`);
};

// toggle follow/unfollow
export const toggleFollow = (targetUserId) => {
  return axios.post("/api/follow", { followingId: targetUserId });
};

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
  try {
    const res = await axios.get(`/api/user/${userId}/songs`);
    // axios interceptor trả về res.data trực tiếp
    // giả sử backend trả về: { statusCode, message, data: [...] }
    return res.data || []; // trả mảng bài hát
  } catch (err) {
    console.error("Error fetching user songs:", err);
    return [];
  }
};


export const uploadSong = async (formData) => {
    const urlBackend = `/api/upload`;
    return axios.post(urlBackend, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}

