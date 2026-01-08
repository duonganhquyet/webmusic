import axios from "./axios.customize";

/* ========================= HOME / SONGS / COMMENTS ========================= */
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

/* ========================= AUTH / USER ========================= */
export const checkUsername = (username) => {
    const urlBackend = `/api/check-username`;
    return axios.get(urlBackend, { params: { username } });
}

export const registerUser = (username, password, fullName) => {
    const urlBackend = "/api/register";
    return axios.post(urlBackend, { username, password, name: fullName });
}

export const loginUser = (username, password) => {
    const urlBackend = "/api/login";
    return axios.post(urlBackend, { username, password });
}

export const checkSession = () => {
    const urlBackend = "/api/me";
    return axios.get(urlBackend);
}

/* ========================= COMMENTS ========================= */
export const postCommentAPI = (userId, trackId, content, moment) => {
    const urlBackend = "/api/comments";
    return axios.post(urlBackend, { userId, trackId, content, moment });
}

/* ========================= USER PANELS ========================= */
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

/* ========================= FOLLOW ========================= */

// Lấy followers của một user
// Nếu muốn public (không login) -> thêm isPublic = true
export const fetchFollowers = (userId, isPublic = false) => {
    const urlBackend = isPublic 
        ? `/api/follow/public/followers/${userId}` 
        : `/api/follow/followers/${userId}`;
    return axios.get(urlBackend);
};

// Lấy following của một user
export const fetchFollowing = (userId, isPublic = false) => {
    const urlBackend = isPublic 
        ? `/api/follow/public/following/${userId}` 
        : `/api/follow/following/${userId}`;
    return axios.get(urlBackend);
};

// Check trạng thái follow (private)
export const checkFollowStatus = (targetUserId) => {
    return axios.get(`/api/follow/status/${targetUserId}`);
}

// Toggle follow/unfollow (private)
export const toggleFollow = (targetUserId) => {
    return axios.post("/api/follow", { followingId: targetUserId });
}

/* ========================= USER HISTORY ========================= */
export const fetchUserHistory = () => {
    const urlBackend = `/api/user/history`;
    return axios.get(urlBackend);
}

export const clearUserHistory = () => {
    const urlBackend = `/api/history/clear`;
    return axios.delete(urlBackend);
}

export const fetchHistory = async () => {
    try {
        const response = await axios.get('/api/history/get-history'); 
        return response.data;
    } catch (error) {
        console.error("Error fetching history:", error);
        return [];
    }
}

/* ========================= UPLOAD & SEARCH ========================= */
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
    try {
        const res = await axios.get(`/api/user/${userId}/songs`);
        return res.data || [];
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
};
    