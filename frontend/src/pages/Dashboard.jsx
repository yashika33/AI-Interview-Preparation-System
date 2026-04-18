import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [interviewData, setInterviewData] = useState({
    position: '',
    experience: '',
    difficulty: ''
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/');
      return;
    }
    setUser(userData);
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInterviewData({ ...interviewData, [name]: value });
  };

  const handleStartInterview = async () => {
    // Validate that all fields are filled
    if (!interviewData.position || !interviewData.experience || !interviewData.difficulty) {
      alert('Please fill in all fields before starting the interview');
      return;
    }

    try {
      const response = await axios.post('https://ai-interviewer-6djd.onrender.com/api/interview/start', {
        userId: user.id,
        ...interviewData
      });
      navigate(`/interview/${response.data.interviewId}`);
    } catch (error) {
      alert('Error starting interview');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>AI Interview Practice Tool</h1>
        <div style={styles.headerButtons}>
          <button style={styles.historyButton} onClick={() => navigate('/history')}>
            📋 View History
          </button>
          <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
        </div>
      </div>
      
      <div style={styles.welcomeSection}>
        <h2>Welcome, {user.firstName} {user.lastName}!</h2>
      </div>
      
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.userIcon}>👤</div>
          <h3 style={styles.cardTitle}>Interview Setup</h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Position</label>
            <input
              type="text"
              name="position"
              placeholder="e.g., Software Intern, Data Analyst"
              style={styles.input}
              value={interviewData.position}
              onChange={handleInputChange}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Experience Level</label>
            <select
              name="experience"
              style={styles.select}
              value={interviewData.experience}
              onChange={handleInputChange}
            >
              <option value="">Select Experience</option>
              <option value="Fresher">Fresher</option>
              <option value="1-2 years">1-2 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5+ years">5+ years</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Difficulty Level</label>
            <select
              name="difficulty"
              style={styles.select}
              value={interviewData.difficulty}
              onChange={handleInputChange}
            >
              <option value="">Select Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <button style={styles.startButton} onClick={handleStartInterview}>
            Start Interview
          </button>
        </div>
        
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>How It Works</h3>
          <div style={styles.instructionList}>
            <div style={styles.instruction}>
              <span style={styles.stepNumber}>1</span>
              <span>Fill in your interview details</span>
            </div>
            <div style={styles.instruction}>
              <span style={styles.stepNumber}>2</span>
              <span>Click "Start Interview" to begin</span>
            </div>
            <div style={styles.instruction}>
              <span style={styles.stepNumber}>3</span>
              <span>Allow microphone access when prompted</span>
            </div>
            <div style={styles.instruction}>
              <span style={styles.stepNumber}>4</span>
              <span>Click the mic button and speak your answer</span>
            </div>
            <div style={styles.instruction}>
              <span style={styles.stepNumber}>5</span>
              <span>AI will ask questions and respond via voice</span>
            </div>
          </div>
        </div>
      </div>
    
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    color: 'white',
    padding: '20px 40px',
    borderRadius: '10px',
    marginBottom: '30px'
  },
  headerButtons: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  historyButton: {
    backgroundColor: 'white',
    color: '#2196F3',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  logoutButton: {
    backgroundColor: '#f44336',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  welcomeSection: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '30px',
    maxWidth: '1200px',
    margin: '0 auto 40px'
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  userIcon: {
    fontSize: '80px',
    marginBottom: '20px'
  },
  cardTitle: {
    marginBottom: '20px',
    color: '#333',
    fontSize: '20px'
  },
  formGroup: {
    marginBottom: '20px',
    textAlign: 'left'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#333',
    fontSize: '14px',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  startButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '15px 30px',
    border: 'none',
    borderRadius: '25px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '20px',
    fontWeight: 'bold',
    width: '100%'
  },
  instructionList: {
    textAlign: 'left',
    marginTop: '20px'
  },
  instruction: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
    fontSize: '14px'
  },
  stepNumber: {
    backgroundColor: '#64B5F6',
    color: 'white',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    flexShrink: 0
  },
  apiSection: {
    backgroundColor: '#4DD0E1',
    color: 'white',
    padding: '30px',
    borderRadius: '10px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  apiTitle: {
    fontSize: '22px',
    marginBottom: '15px',
    textAlign: 'center'
  },
  apiList: {
    listStyle: 'none',
    fontSize: '16px',
    lineHeight: '2'
  }
};

export default Dashboard;