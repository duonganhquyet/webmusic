import { use, useEffect, useState } from "react";
import Container from "../components/container";
import WaveTrack from "../components/track/wave.track";
import { useParams } from "react-router-dom";
import { fetchCommentById, fetchSongById } from "../services/api";


const  TrackPage =  ()  =>  {
    const  { id } = useParams();
    console.log("check track id:",id);
    const [track,setTrack] = useState(null);
    const [comments,setComments] = useState(null);
    useEffect(() => {
        const fetchDataDetail = async () => {
            const response = await fetchSongById(id);
            if(response && response.data){
                setTrack(response.data);
            }
            
        }
        fetchDataDetail();

        const fetCommentData = async () => {
            const response = await fetchCommentById(id);
            if(response && response.data){
                setComments(response.data);
            }
        }
        fetCommentData();
    },[])
    

    return (
        <Container>
            <WaveTrack track={track}
                comments={comments}
            />
        </Container>
    )
}
export default TrackPage;