// import WavesurferPlayer from '@wavesurfer/react'
import { PauseCircleFilled, PlayCircleFilled } from "@ant-design/icons";
import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import '../../assets/styles/track.css';
import { useWavesurfer } from '@wavesurfer/react'

const WaveTrack = () => {
    // const [isPlaying,setIsPlaying] = useState(false);
    const [time,setTime] = useState("0:00");
    const [duration,setDuration] = useState("0:00");
    const containerRef = useRef(null);
    const hoverRef = useRef(null);
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const gradientMemo = useMemo (() => {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 1.15)
        gradient.addColorStop(0, '#656666') // Top color
        gradient.addColorStop((canvas.height * 0.7) / canvas.height, '#656666') // Top color
        gradient.addColorStop((canvas.height * 0.7 + 1) / canvas.height, '#ffffff') // White line
        gradient.addColorStop((canvas.height * 0.7 + 2) / canvas.height, '#ffffff') // White line
        gradient.addColorStop((canvas.height * 0.7 + 3) / canvas.height, '#B1B1B1') // Bottom color
        gradient.addColorStop(1, '#B1B1B1') // Bottom color
        return gradient;
    }, [])

    const progressGradientMemo = useMemo (() => {
        const progressGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 1.15)
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
    

    const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
        container: containerRef,
        height: 100,
        waveColor: gradientMemo,
        progressColor: progressGradientMemo,
        url: '../../../public/Mat-Ket-Noi.mp3',
        barWidth: 2.3,
    })


    useEffect(()=>{
        if(!wavesurfer) return;
        // setIsPlaying(false);
        const hover = hoverRef.current;
        const waveform = containerRef.current;
        waveform.addEventListener('pointermove', (e) => (hover.style.width = `${e.offsetX}px`));
        const subscriptions = [
            // wavesurfer.on("play",()=>setIsPlaying(true)),
            // wavesurfer.on("pause",()=>setIsPlaying(false)),
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


    return (
        <>
        <div style={{marginTop: "20px",display: "flex",width:"100%"}}>
                <div className="track-item">
                    <div ref={containerRef} className="wave-form-container" style={{width:"65%",marginLeft:15}}>
                        <div className="time" >{time}</div>
                        <div className="duration" >{duration}</div>
                        <div ref={hoverRef} className="hover-wave" id="hover"></div>
                    </div>
                    <div className="info-track">
                        <div className="info-track_btn" onClick={()=>{
                            onPlayPause();
                            // if(track && wavesurfer)
                            //     setCurrentTrack({...currentTrack,isPlaying: false});
                        }
                        }
                        >
                            {isPlaying === true ? <PauseCircleFilled style={{fontSize:50,color: "#ff6000"}}/> : <PlayCircleFilled style={{fontSize:50,color: "#ff6000"}}/>}
                        </div>
                        <div>
                            <span className="info-track_title">tiep hehe</span>
                            <span className="info-track_author">tiep</span>
                        </div>
                    </div>
                    <div className="img-wrap">
                        <img src={`https://i.pinimg.com/474x/e6/34/d3/e634d384fb0c31d7245d70d6f70f830d.jpg`} alt="" className="img-track"/>
                    </div>
                    {/* Comment on wave */}
                    {/* <div className="comments" style={{position:"relative",background: "red",width:"75%",marginLeft:15}}>
    
                        {
                            comments && comments.map((v)=>(
                                <Tooltip title={v.content} arrow key={v._id}>
    
                                <img
                                onPointerMove={(e)=>{
                                    const hover = hoverRef.current!;
                                    hover.style.opacity = "1",
                                    hover.style.width = calLeft(v.moment);
                                }}
                                key={v._id} style={{width:"20px",height:"20px",position:"absolute",bottom:"5px",zIndex:20,
                                    left: calLeft(v.moment)
                                }}
                                src={fetchDefaultImages(v.user.type)} alt="" />
                                </Tooltip>
                            ))
                        }
                        
                    </div> */}
                </div>
                
            </div>
        
        </>
    )
}

export default WaveTrack;