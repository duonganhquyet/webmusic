import { createContext, useContext, useState } from "react";

export const TrackContext = createContext(null);

export const TrackContextProvider = ({ children }) => {
    const initValue = {
        _id: "",
        title: "",
        description: "",
        category: "",
        imgUrl: "",
        trackUrl: "",
        countLike: 0,
        countPlay: 0,
        uploader: {
            _id: "",
            name: "",
            role: "",
        },
        isDeleted: false,
        createdAt: "",
        updatedAt: "",
        isPlaying: false,
    }
    const [currentTrack, setCurrentTrack] = useState(initValue);

    return (
        <TrackContext.Provider value={{ currentTrack, setCurrentTrack }}>
            {children}
        </TrackContext.Provider>
    )
};
export const useTrackContext = () => useContext(TrackContext);