import { useEffect, useState } from "react";
import Container from "../components/container";
import WaveTrack from "../components/track/wave.track";
import { useParams } from "react-router-dom";
import { checkSongLikeStatus, fetchCommentById, fetchSongById } from "../services/api";
import { useAuthContext } from "../contexts/auth.context"; //
import AddToPlaylistModal from "../components/Library/AddToPlaylistModal";

// 1. Import UI Ant Design
import { Button, message, Tooltip } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const  TrackPage =  ()  =>  {
    const  { id } = useParams();
    console.log("check track id:",id);
    const [track,setTrack] = useState(null);
    const [comments,setComments] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [addPlaylistTrackId, setAddPlaylistTrackId] = useState(null);

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
        // Kiểm tra xem dữ liệu bài hát đã tải xong chưa
        if (!track || !track.trackUrl) {
            message.error("Không tìm thấy file nhạc!");
            return;
        }

        try {
            // Hiển thị thông báo đang xử lý
            message.loading("Đang tải xuống...", 1);
            
            // ✅ Tạo đường dẫn file dựa trên cấu hình static file trong app.js
            // Backend: app.use('/track', express.static(...));
            // Dữ liệu: track.trackUrl = "ten-bai-hat.mp3"
            const fileUrl = `${import.meta.env.VITE_BACKEND_URL}/track/${track.trackUrl}`;
            
            // Dùng fetch để lấy dữ liệu dưới dạng Blob (Binary Large Object)
            // Cách này tốt hơn thẻ <a> bình thường vì nó ép buộc trình duyệt tải xuống thay vì tự mở file để phát
            const response = await fetch(fileUrl);
            

            const blob = await response.blob();
            
            // Tạo một đường dẫn ảo (Object URL) trỏ tới blob vừa tải
            const url = window.URL.createObjectURL(blob);
            
            // Tạo thẻ <a> ẩn để kích hoạt tải xuống
            const link = document.createElement('a');
            link.href = url;
            
            // Đặt tên file khi tải về máy (Ưu tiên dùng Tên bài hát.mp3)
            const fileName = track.title ? `${track.title}.mp3` : track.trackUrl;
            link.setAttribute('download', fileName); 
            
            // Thêm vào DOM, click, và xóa ngay lập tức
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            
            // Giải phóng bộ nhớ
            window.URL.revokeObjectURL(url);
            
            message.success("Tải xuống hoàn tất!");
        } catch (error) {
            console.error("Lỗi tải file:", error);
            message.error("Không thể tải file. Vui lòng thử lại sau.");
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
                    onAddPlaylist={(t) => setAddPlaylistTrackId(t._id)}
                />
            </Container>

             {addPlaylistTrackId && (
                <AddToPlaylistModal
                    trackId={addPlaylistTrackId}
                    onClose={() => setAddPlaylistTrackId(null)}
                    onAdded={() => setAddPlaylistTrackId(null)}
                />
            )}
        </>
    )
}

export default TrackPage;