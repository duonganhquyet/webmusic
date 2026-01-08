import { use, useEffect, useState } from "react";
import Container from "../components/container";
import WaveTrack from "../components/track/wave.track";
import { useParams } from "react-router-dom";
import { checkSongLikeStatus, fetchCommentById, fetchSongById } from "../services/api";


const  TrackPage =  ()  =>  {
    const  { id } = useParams();
    console.log("check track id:",id);
    const [track,setTrack] = useState(null);
    const [comments,setComments] = useState(null);
    const [isLiked, setIsLiked] = useState(false);

    const checkLikeStatus = async (songId) => {
        try {
            const response = await checkSongLikeStatus(songId);
            if(response && response.data){
                setIsLiked(response.data.liked);
            }
        } catch (error) {
            console.log("Error checking like status:", error);
        }
    }
    
    
    
    const fetchCommentData = async () => {
            const response = await fetchCommentById(id);
            if(response && response.data){
                setComments(response.data);
            }
        }

    

    useEffect(() => {
        const fetchDataDetail = async () => {
            const response = await fetchSongById(id);
            if(response && response.data){
                setTrack(response.data);
                console.log("track data:",response.data);
            }
            
        }
        fetchDataDetail();

        
        fetchCommentData();

        checkLikeStatus(id);
    },[])
    

    return (
        <>
            <div style={{marginTop: 55}}></div>
            <Container>
                <WaveTrack track={track}
                    comments={comments}
                    fetchCommentData={fetchCommentData}
                    setIsLiked={setIsLiked}
                    isLiked={isLiked}
                />
            </Container>
        </>
    )
}
export default TrackPage;