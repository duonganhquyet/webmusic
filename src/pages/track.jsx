import { useEffect, useState } from "react";
import Container from "../components/container";
import WaveTrack from "../components/track/wave.track";
import { useParams } from "react-router-dom";
import { checkSongLikeStatus, fetchCommentById, fetchSongById } from "../services/api";
import { useAuthContext } from "../contexts/auth.context"; //

// 1. Import UI Ant Design
import { Button, message, Tooltip } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

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
    },[]);
    
    // 2. Hàm xử lý tải file
    const handleDownload = async () => {
        if (!track || !track.trackUrl) {
            message.error("Không tìm thấy file nhạc!");
            return;
        }

        try {
            message.loading("Đang tải xuống...", 1);
            
            // Đường dẫn file từ backend
            const fileUrl = `${API_BASE}/track/${track.trackUrl}`;
            
            // Dùng fetch để tải blob về máy (tránh việc trình duyệt tự mở file)
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // Đặt tên file tải về
            link.setAttribute('download', track.title ? `${track.title}.mp3` : track.trackUrl); 
            
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            message.success("Tải xuống hoàn tất!");
        } catch (error) {
            console.error("Lỗi tải file:", error);
            message.error("Không thể tải file. Hãy thử lại.");
        }
    };

    return (
        <>
            <div style={{marginTop: 55}}></div>
            <Container>
                {/* 3. Đặt nút Download ở đây (Phía trên WaveTrack) */}
                {track && (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        marginBottom: 10 // Tạo khoảng cách với player
                    }}>
                        <Tooltip title="Tải nhạc về máy">
                            <Button 
                                type="primary" 
                                icon={<DownloadOutlined />} 
                                onClick={handleDownload}
                                style={{ 
                                    backgroundColor: '#faad14', 
                                    borderColor: '#faad14',
                                    fontWeight: 'bold',
                                    color: '#fff'
                                }}
                            >
                                Tải MP3
                            </Button>
                        </Tooltip>
                    </div>
                )}

                <WaveTrack 
                    track={track}
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