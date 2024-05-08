import { useEffect, useRef } from "react";


export const Receiver = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(()=>{
    const socket = new WebSocket('ws://localhost:8080')
    socket.onopen = () =>{
      socket.send(JSON.stringify({type:'receiver'}));
      let pc : RTCPeerConnection |null =null;
      socket.onmessage = async (event) =>{
        const message = JSON.parse(event.data);
        if(message.type === "createOffer"){
           pc = new RTCPeerConnection();
           pc.setRemoteDescription(message.sdp);
          pc.onicecandidate = (event)=>{
            console.log(event)
            if(event.candidate){
              socket?.send(JSON.stringify({type:'iceCandidate', candidate:event.candidate}))
            }
          }

          pc.ontrack = (event) =>{
            const video = document.createElement('video')
            document.body.appendChild(video);
            video.srcObject = new MediaStream ([event.track]);
            video.play()
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer)
          socket?.send(JSON.stringify({type:'createAnswer', sdp:pc.localDescription}))

        }else if(message.type === "iceCandidate"){
            pc?.addIceCandidate(message.candidate);
        }
      }
      
    }
  },[]);
  
  return <div>
    Receiver
    
    </div>
  
}

