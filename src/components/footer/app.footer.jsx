import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import Container from '../container';
import '../../assets/styles/footer.css';
import { useTrackContext } from '../../contexts/track.context';
import { useRef } from 'react';
const AppFooter = () => {
    const playRef = useRef(null);

    const {currentTrack,setCurrentTrack} = useTrackContext()
    if(currentTrack?.isPlaying){
        playRef?.current?.audio?.current.play();   
    }
    else{
        playRef?.current?.audio?.current.pause();
    }
    return(
        <>
            {currentTrack._id && <div style={{position: "fixed", bottom: "0", width: "100%",background: "#f2f2f2"}}>
                <Container style={{display: "flex", columnGap: "50px"}}>
                    <AudioPlayer
                    ref={playRef}
                    // autoPlay
                    volume={0.5}
                    style={{
                        boxShadow: "unset",
                        background: "#f2f2f2"
                    }}
                    layout="horizontal-reverse"
                    onPlay={()=>{
                        setCurrentTrack({...currentTrack,isPlaying: true})
                    }}
                    onPause={()=>{
                        setCurrentTrack({...currentTrack,isPlaying: false})
                    }}
                    src={`${import.meta.env.VITE_BACKEND_URL}/track/${currentTrack.trackUrl}`}
                    // other props here
                    />
    
                    <div style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "start",
                                justifyContent: "center",
                                minWidth: "100px"
                            }}>
                                <div style={{ color: "#ccc"}}>{currentTrack.uploader.name}</div>
                                <div className="track-title-footer">{currentTrack.title}</div>
                    </div>
                </Container>
            </div>}  
        </>
    )
}

export default AppFooter;