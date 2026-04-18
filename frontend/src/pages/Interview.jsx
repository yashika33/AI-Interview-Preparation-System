import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

function Interview() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const socketRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socketRef.current = io('https://ai-interviewer-6djd.onrender.com');
    socketRef.current.emit('join-interview', { interviewId });

    socketRef.current.on('ai-response', (data) => {
      setMessages(prev => [...prev, { role: 'ai', text: data.message }]);
      speakText(data.message);
    });

    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessages(prev => [...prev, { role: 'user', text: transcript }]);
        socketRef.current.emit('user-message', { interviewId, message: transcript });
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        setIsRecording(false);
        if (event.error !== 'no-speech') alert('Speech recognition error. Please try again.');
      };

      recognitionRef.current.onend = () => setIsRecording(false);
    }

    return () => {
      socketRef.current?.disconnect();
      window.speechSynthesis?.cancel();
    };
  }, [interviewId]);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = () => {
    if (!recognitionRef.current) return alert('Speech recognition only works in Chrome');
    setIsRecording(true);
    try { recognitionRef.current.start(); } catch { setIsRecording(false); }
  };

  const handleStopInterview = async () => {
    try {
      await axios.post(`https://ai-interviewer-6djd.onrender.com/api/interview/stop/${interviewId}`);
      window.speechSynthesis?.cancel();
      navigate('/dashboard');
    } catch {
      alert('Error stopping interview');
    }
  };

  return (
    <div style={styles.container}>

      {/* TOP SECTION WITH DEMO INTERVIEWER */}
      <div style={styles.interviewerSection}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
          alt="interviewer"
          style={styles.interviewerImage}
        />
        <h2 style={styles.interviewerTitle}>Your AI Interviewer</h2>
        <p style={styles.interviewerSubtitle}>I will ask questions and guide your interview. Speak clearly!</p>
      </div>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>🎤 Interview in Progress</h1>
        <button style={styles.stopButton} onClick={handleStopInterview}>⛔ End Interview</button>
      </div>

      {/* CHAT WINDOW */}
      <div style={styles.chatContainer}>
        {messages.length === 0 && (
          <div style={styles.welcomeMessage}>Waiting for the AI interviewer to begin...</div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              background: msg.role === 'user' ? '#4A90E2' : '#E3E7EA',
              color: msg.role === 'user' ? 'white' : '#333'
            }}
          >
            <div style={styles.messageSender}>
              {msg.role === 'user' ? '👤 You' : '🤖 AI Interviewer'}
            </div>
            <div style={styles.messageText}>{msg.text}</div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* RECORDING CONTROLS */}
      <div style={styles.controls}>
        <p style={styles.instruction}>
          {isRecording ? '🎙️ Listening... speak now!' : 'Press the button and answer the question'}
        </p>
        <button
          style={{
            ...styles.recordButton,
            backgroundColor: isRecording ? '#E53935' : '#43A047'
          }}
          onClick={startRecording}
          disabled={isRecording}
        >
          {isRecording ? '🔴 Recording...' : '🎤 Start Speaking'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: '#F7F9FC',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },

  interviewerSection: {
    textAlign: 'center',
    padding: '25px 10px 10px'
  },
  interviewerImage: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  interviewerTitle: {
    fontSize: '22px',
    marginTop: '10px',
    fontWeight: '600'
  },
  interviewerSubtitle: {
    color: '#666',
    marginTop: '5px'
  },

  header: {
    background: '#2196F3',
    color: 'white',
    padding: '18px 25px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600'
  },
  stopButton: {
    background: '#E53935',
    padding: '10px 16px',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer'
  },

  chatContainer: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  welcomeMessage: {
    textAlign: 'center',
    color: '#777',
    marginTop: '40px',
    fontSize: '17px'
  },

  message: {
    maxWidth: '75%',
    padding: '14px 18px',
    borderRadius: '12px',
    boxShadow: '0 3px 6px rgba(0,0,0,0.1)'
  },
  messageSender: {
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '6px'
  },
  messageText: {
    fontSize: '15px',
    lineHeight: '1.5'
  },

  controls: {
    background: 'white',
    padding: '18px',
    textAlign: 'center',
    borderTop: '1px solid #ddd'
  },
  instruction: {
    color: '#555',
    marginBottom: '10px'
  },
  recordButton: {
    padding: '15px 35px',
    border: 'none',
    borderRadius: '30px',
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)' 
  }
};

export default Interview;