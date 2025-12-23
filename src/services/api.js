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
    const urlBackend =  `/api/song/${id}/comments`;
    return axios.get(urlBackend);
};