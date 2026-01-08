// import WavesurferPlayer from '@wavesurfer/react'
import { PauseCircleFilled, PlayCircleFilled, HeartFilled, HeartOutlined, UserAddOutlined, CheckOutlined } from "@ant-design/icons";
import { useRef, useState, useMemo, useCallback, useEffect, use } from "react";
import '../../assets/styles/track.css';
import { useWavesurfer } from '@wavesurfer/react'
import { useTrackContext } from "../../contexts/track.context";
import { useAuthContext } from "../../contexts/auth.context";
import { likeSongAPI, dislikeSongAPI} from "../../services/api";
import CommentTrack from "./comment.track";

const WaveTrack = (props) => {
    const {track,comments,isLiked,setIsLiked} = props;
    const { auth } = useAuthContext();
    const isOwner = auth?.user?._id === track?.uploader?._id;
    
    const [isPlaying,setIsPlaying] = useState(false);

    const [time,setTime] = useState("0:00");
    const [duration,setDuration] = useState("0:00");
    const { currentTrack, setCurrentTrack } = useTrackContext();
    const containerRef = useRef(null);
    const hoverRef = useRef(null);
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const gradientMemo = useMemo (() => {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 1.35)
        gradient.addColorStop(0, '#656666') // Top color
        gradient.addColorStop((canvas.height * 0.7) / canvas.height, '#656666') // Top color
        gradient.addColorStop((canvas.height * 0.7 + 1) / canvas.height, '#ffffff') // White line
        gradient.addColorStop((canvas.height * 0.7 + 2) / canvas.height, '#ffffff') // White line
        gradient.addColorStop((canvas.height * 0.7 + 3) / canvas.height, '#B1B1B1') // Bottom color
        gradient.addColorStop(1, '#B1B1B1') // Bottom color
        return gradient;
    }, [])

    const progressGradientMemo = useMemo (() => {
        const progressGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 1.35)
        progressGradient.addColorStop(0, '#EE772F') // Top color
        progressGradient.addColorStop((canvas.height * 0.7) / canvas.height, '#EB4926') // Top color
        progressGradient.addColorStop((canvas.height * 0.7 + 1) / canvas.height, '#ffffff') // White line
        progressGradient.addColorStop((canvas.height * 0.7 + 2) / canvas.height, '#ffffff') // White line
        progressGradient.addColorStop((canvas.height * 0.7 + 3) / canvas.height, '#F6B094') // Bottom color
        progressGradient.addColorStop(1, '#F6B094') // Bottom color
        return progressGradient;
    }, [])

    const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secondsRemainder = Math.round(seconds) % 60
    const paddedSeconds = `0${secondsRemainder}`.slice(-2)
    return `${minutes}:${paddedSeconds}`
    }

    const calLeft = (moment) =>{
        const hardCodeDuration = wavesurfer?.getDuration();
        if(hardCodeDuration){
            const percent = moment/hardCodeDuration*100;
            return `${percent}%`
        }
        return "0px";
    }
    

    const { wavesurfer, currentTime } = useWavesurfer({
        container: containerRef,
        // height: 100,
        waveColor: gradientMemo,
        progressColor: progressGradientMemo,
        url: `${import.meta.env.VITE_BACKEND_URL}/track/${track?.trackUrl}`,
        barWidth: 2.3,
    })

    useEffect(()=>{
        if(track?._id && !currentTrack?._id){
            setCurrentTrack({...track, isPlaying: false})
            console.log("Check start track", currentTrack?.isPlaying);
            
        }
    },[track?._id])

    useEffect(()=>{
        if(track?._id && track?._id !== currentTrack?._id){
            setCurrentTrack({...track, isPlaying: false})
        }
    },[track?._id])


    useEffect(()=>{
        if(wavesurfer && currentTrack?.isPlaying){
            wavesurfer.pause();
        }
        console.log("check start track wave", currentTrack?.isPlaying);
        
    },[currentTrack])

    useEffect(()=>{
        if(!wavesurfer) return;
        setIsPlaying(false);
        const hover = hoverRef.current;
        const waveform = containerRef.current;
        waveform.addEventListener('pointermove', (e) => (hover.style.width = `${e.offsetX}px`));
        const subscriptions = [
            wavesurfer.on("play",()=>setIsPlaying(true)),
            wavesurfer.on("pause",()=>setIsPlaying(false)),
            wavesurfer.on('decode', (duration) => {
                setDuration(formatTime(duration));
            }),
            wavesurfer.on('timeupdate', (currentTime) => {
                setTime(formatTime(currentTime));
            }),
            wavesurfer.on('interaction', () => {
                wavesurfer.play()
            })

        ];
        return ()=>{
            subscriptions.forEach((unsub) => unsub());
        }
    },[wavesurfer]);

    const onPlayPause = useCallback(() => {
        wavesurfer && wavesurfer.playPause()
    }, [wavesurfer])

    const handleLike = async (e) => {
        e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài nếu cần
        if (!auth?.user?._id) {
            alert("Vui lòng đăng nhập để thích bài hát!");
            return;
        }
        try {
            if (isLiked) {
                await dislikeSongAPI(track._id);
                setIsLiked(false);
            } else {
                await likeSongAPI(track._id);
                setIsLiked(true);
            }
        } catch (error) {
            console.error("Lỗi Like:", error);
        }
    };



    return (
        <>
        <div style={{marginTop: "20px",display: "flex",width:"100%"}}>
                <div className="track-item">
                    <div ref={containerRef} className="wave-form-container" style={{width:"65%",marginLeft:15}}>
                        <div className="time" >{time}</div>
                        <div className="duration" >{duration}</div>
                        <div ref={hoverRef} className="hover-wave" id="hover"></div>
                    </div>
                    <div className="info-track" style={{ width: "65%" }}>
                        <div className="info-track_btn" style={{cursor: "pointer"}} onClick={()=>{
                            onPlayPause();
                            if(track && wavesurfer)
                                setCurrentTrack({...currentTrack,isPlaying: false});
                        }
                        }
                        >
                            {isPlaying === true ? <PauseCircleFilled style={{fontSize:50,color: "#ff6000"}}/> : <PlayCircleFilled style={{fontSize:50,color: "#ff6000"}}/>}
                        </div>

                        <div>
                            <span className="info-track_title">{track?.title}</span> 
                            <span className="info-track_author">{track?.uploader?.name}</span>
                        </div>

                         {/* === NÚT LIKE (MỚI - ĐẨY SANG PHẢI) === */}
                         {/* Sử dụng marginLeft: auto để đẩy về cuối flex container (nếu container không dùng justifyContent space-between)
                             Hoặc nếu muốn nằm cuối "metadata" thì đặt ở đây. 
                             Dựa vào yêu cầu "Đối ngược với nút play", ta sẽ đẩy nó ra xa nút Play nhất có thể trong container này. */}
                         {!isOwner && (
                         <div 
                            title={isLiked ? "Bỏ thích" : "Thích bài hát"}
                            style={{ 
                                cursor: "pointer", 
                                marginLeft: 'auto', // Tạo khoảng cách với Title/Author
                                paddingRight: 20,
                                display: "flex", 
                                alignItems: "center" 
                            }} 
                            onClick={handleLike}
                        >
                            {isLiked ? <HeartFilled style={{fontSize:30,color: "#ff6000"}}/> : <HeartOutlined style={{fontSize:30,color: "#fff"}}/>}
                        </div>
                        )}

                    </div>
                    <div className="img-wrap">
                        <img src={`https://i.pinimg.com/474x/e6/34/d3/e634d384fb0c31d7245d70d6f70f830d.jpg`} alt="" className="img-track"/>
                    </div>
                    {/* Comment on wave */}
                    <div className="comments" style={{position:"relative",background: "red",width:"65%",marginLeft:15}}>
    
                        {
                            comments && comments.map((v)=>(
                                <div title={v.content} arrow key={v._id}>
    
                                <img
                                onPointerMove={(e)=>{
                                    const hover = hoverRef.current;
                                    hover.style.opacity = "1"; // Sửa lỗi cú pháp dấu phẩy
                                    hover.style.width = calLeft(v.moment);
                                }}
                                key={v._id} 
                                style={{width:"20px",height:"20px",position:"absolute",bottom:"14px",zIndex:20,
                                    left: calLeft(v.moment),
                                    borderRadius: "50%"
                                }}
                                src={(v?.user?.imgUrl && v?.user?.imgUrl !== "default_avatar.png") 
                                    ? `${import.meta.env.VITE_BACKEND_URL}/images/${v.user.imgUrl}` 
                                    : "../../../public/default_avatar.png"}
                                alt="U"
                                 />
        
                                </div>
                            ))
                        }
                        
                    </div>
                </div>
            </div>
            <div style={{marginTop: 50}}>
                <CommentTrack
                    currentTime={currentTime}
                    formatTime={formatTime}
                    comments={comments}
                    track={track}
                    fetchCommentData={props.fetchCommentData}
                />
            </div>
        
        </>
    )
}

export default WaveTrack;