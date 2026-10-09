// VideoCallScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Button, PermissionsAndroid, Alert, TouchableOpacity } from 'react-native';
import { RTCPeerConnection, RTCView, mediaDevices } from 'react-native-webrtc';
import socket from '../../Utils/Socket';
import { screenHeight, screenWidth } from '../../Utils/Screens';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Assuming you have this installed

const VideoCallScreen = ({ roomId,Dep,route, navigation ,close}) => {
 
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const peerConnection = useRef(null);




  useEffect(() => {
    let isMounted = true;

    const initializeCall = async () => {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        
        if (
          granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          const stream = await startLocalStream();
          if (isMounted) {
            setLocalStream(stream);
            setupWebRTC(stream);
            socket.emit('join', roomId);
          }
        }
      } catch (err) {
        console.error('Error initializing call:', err);
        Alert.alert('Error', 'Failed to initialize video call');
      }
    };

    initializeCall();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [roomId]);

  const startLocalStream = async () => {
    try {
      return await mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: 640,
          height: 480,
          frameRate: 30,
          facingMode: isFrontCamera ? 'user' : 'environment',
        },
      });
    } catch (err) {
      console.error('Error accessing media devices:', err);
      throw err;
    }
  };

  const setupWebRTC = (stream) => {
    const pc_config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
         { urls: 'stun:stun1.l.google.com:19302' },
      
      ],
       iceCandidatePoolSize: 10,
    };
    
    peerConnection.current = new RTCPeerConnection(pc_config);
    
    // Add local stream to peer connection
   if (peerConnection.current.addTrack) {
  stream.getTracks().forEach(track => {
    peerConnection.current.addTrack(track, stream);
  });
 } else if (peerConnection.current.addStream) {
  peerConnection.current.addStream(stream);
} else {
  stream.getTracks().forEach(track => {
    peerConnection.current.addTransceiver(track, {
      streams: [stream]
    });
  });
}
    // ICE Candidate handler
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', event.candidate, roomId);
      }
    };
    
    // Remote stream handler
    peerConnection.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };
    
    // Socket event listeners
    socket.on('user-connected', createOffer);
    socket.on('user-disconnected', () => setRemoteStream(null));
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
  };

  const createOffer = async () => {
    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit('offer', offer, roomId,{group:Dep});
    } catch (err) {
      console.error('Error creating offer:', err);
    }
  };

 

  const handleAnswer = async (answer, fromId) => {
    try {
      await peerConnection.current.setRemoteDescription(answer);
    } catch (err) {
      console.error('Error handling answer:', err);
    }
  };

  const handleIceCandidate = async (candidate, fromId) => {
    try {
      await peerConnection.current.addIceCandidate(candidate);
    } catch (err) {
      console.error('Error adding ICE candidate:', err);
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  const switchCamera = async () => {
    if (localStream) {
      setIsFrontCamera(!isFrontCamera);
      const newStream = await startLocalStream();
      setLocalStream(newStream);
      
      // Replace tracks in peer connection
      const sender = peerConnection.current.getSenders().find(s => s.track.kind === 'video');
      if (sender) {
        sender.replaceTrack(newStream.getVideoTracks()[0]);
      }
    }
  };

  const endCall = () => {
    cleanup();
    close(false)
    //navigation.goBack();
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    socket.off('user-connected');
    socket.off('user-disconnected');
    socket.off('offer');
    socket.off('answer');
    socket.off('ice-candidate');
  };

  return (<View style={{flex:1,height:"100%"}}>
    <View style={styles.container}>
      {remoteStream ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteVideo}
          objectFit="cover"
        />
      ) : (
        <View style={styles.remoteVideo}>
          <Text style={styles.waitingText}>Waiting for participant to join...</Text>
        </View>
      )}
      
      {localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={styles.localVideo}
          objectFit="cover"
          mirror={isFrontCamera}
        />
      )}
       <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
          <Ionicons 
            name={isMuted ? "mic-off" : "mic"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={toggleVideo}>
          <Ionicons 
            name={isVideoOn ? "videocam" : "videocam-off"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={switchCamera}>
          <Ionicons 
            name="camera-reverse" 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.controlButton, styles.endCallButton]} onPress={endCall}>
          <Ionicons 
            name="call" 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
      
    </View>
 </View>
  
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingText: {
    color: 'white',
    fontSize: 18,
  },
  localVideo: {
    position: 'absolute',
    width: 120,
    height: 160,
    top: 20,
    right: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  controls: {
    position: 'absolute',
    top:screenHeight/1.2,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    zIndex:10001
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallButton: {
    backgroundColor: 'red',
  },
});

export default VideoCallScreen;