import axios from "./axios.customize";

export const fetchHomeData = () => {
    const urlBackend = "/api/songs/home";
    return axios.get(urlBackend);  
};

export const fetchSongById = (id) => {
    const urlBackend =  `/api/song/${id}`;
    return axios.get(urlBackend);
};

export const fetchCommentById = (id) => {
    const urlBackend =  `/api/comments/${id}`;
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