import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const SIGNALING_URL = 'ws://localhost:3000';

export default function VideoCallModal({ selfId, peerId, show, onClose }) {
  const [callState, setCallState] = useState('idle'); // idle, calling, incoming, in-call
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [socket, setSocket] = useState(null);
  const pcRef = useRef();

  useEffect(() => {
    const s = io(SIGNALING_URL, { query: { userId: selfId } });
    setSocket(s);
    s.on('incoming-call', async (data) => {
      setCallState('incoming');
      window._incomingOffer = data.offer;
    });
    s.on('call-accepted', async (data) => {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      setCallState('in-call');
    });
    s.on('call-rejected', () => {
      setCallState('idle');
      alert('Call rejected');
    });
    s.on('ice-candidate', async (data) => {
      if (data.candidate) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });
    s.on('hangup', () => {
      setCallState('idle');
      cleanup();
    });
    return () => s.disconnect();
  }, [selfId]);

  const startCall = async () => {
    setCallState('calling');
    const pc = createPeerConnection();
    pcRef.current = pc;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('call-user', { toUserId: peerId, fromUserId: selfId, offer });
  };

  const acceptCall = async () => {
    setCallState('in-call');
    const pc = createPeerConnection();
    pcRef.current = pc;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    await pc.setRemoteDescription(new RTCSessionDescription(window._incomingOffer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('accept-call', { toUserId: peerId, answer });
  };

  const rejectCall = () => {
    setCallState('idle');
    socket.emit('reject-call', { toUserId: peerId });
  };

  const hangup = () => {
    setCallState('idle');
    socket.emit('hangup', { toUserId: peerId });
    cleanup();
  };

  function createPeerConnection() {
    const pc = new RTCPeerConnection();
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { toUserId: peerId, candidate: event.candidate });
      }
    };
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };
    return pc;
  }

  function cleanup() {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
  }

  if (!show) return null;

  return (
    <div className="video-call-modal">
      {callState === 'idle' && <button onClick={startCall}>Start Video Call</button>}
      {callState === 'calling' && <div>Calling...</div>}
      {callState === 'incoming' && (
        <div>
          Incoming call... <button onClick={acceptCall}>Accept</button> <button onClick={rejectCall}>Reject</button>
        </div>
      )}
      {callState === 'in-call' && (
        <div>
          <video autoPlay playsInline ref={(v) => v && localStream && (v.srcObject = localStream)} muted style={{ width: 200 }} />
          <video autoPlay playsInline ref={(v) => v && remoteStream && (v.srcObject = remoteStream)} style={{ width: 200 }} />
          <button onClick={hangup}>Hang Up</button>
        </div>
      )}
      <button onClick={onClose}>Close</button>
    </div>
  );
}
