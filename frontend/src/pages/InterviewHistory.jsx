import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function InterviewHistory() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/');
      return;
    }
    setUser(userData);
    fetchInterviews(userData.id);
  }, [navigate]);

  const fetchInterviews = async (userId) => {
    try {
      const response = await axios.get(`https://ai-interviewer-6djd.onrender.com/api/interviews/user/${userId}`);
      setInterviews(response.data.interviews);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      setLoading(false);
    }
  };

  const handleViewReport = (interviewId) => {
    navigate(`/report/${interviewId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <h2>Loading interviews...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Interview History</h1>
        <button style={styles.backButton} onClick={handleBackToDashboard}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.statsCard}>
          <h2>Your Statistics</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>{interviews.length}</div>
              <div style={styles.statLabel}>Total Interviews</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>
                {interviews.filter(i => !i.isStart).length}
              </div>
              <div style={styles.statLabel}>Completed</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>
                {interviews.filter(i => i.isStart).length}
              </div>
              <div style={styles.statLabel}>In Progress</div>
            </div>
          </div>
        </div>

        <h2 style={styles.sectionTitle}>Your Interviews</h2>

        {interviews.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No interviews yet. Start your first interview from the dashboard!</p>
            <button style={styles.primaryButton} onClick={handleBackToDashboard}>
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div style={styles.interviewList}>
            {interviews.map((interview) => (
              <div key={interview._id} style={styles.interviewCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.position}>{interview.position}</h3>
                    <p style={styles.date}>{formatDate(interview.createdAt)}</p>
                  </div>
                  <div style={{
                    ...styles.statusBadge,
                    backgroundColor: interview.isStart ? '#FFA726' : '#66BB6A'
                  }}>
                    {interview.isStart ? 'In Progress' : 'Completed'}
                  </div>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Experience:</span>
                    <span style={styles.detailValue}>{interview.experience}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Difficulty:</span>
                    <span style={styles.detailValue}>{interview.difficulty}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Messages:</span>
                    <span style={styles.detailValue}>
                      {interview.chatTranscript.length} exchanges
                    </span>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  {!interview.isStart && interview.chatTranscript.length > 0 && (
                    <button 
                      style={styles.reportButton}
                      onClick={() => handleViewReport(interview._id)}
                    >
                      📊 Generate Report
                    </button>
                  )}
                  {interview.isStart && (
                    <button 
                      style={styles.continueButton}
                      onClick={() => navigate(`/interview/${interview._id}`)}
                    >
                      Continue Interview
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  },
  header: {
    backgroundColor: '#2196F3',
    color: 'white',
    padding: '20px 40px',
    borderRadius: '10px',
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  backButton: {
    backgroundColor: 'white',
    color: '#2196F3',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  statsCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    marginBottom: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  statItem: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#666'
  },
  sectionTitle: {
    marginBottom: '20px',
    color: '#333'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  emptyText: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '20px'
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  interviewList: {
    display: 'grid',
    gap: '20px'
  },
  interviewCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    cursor: 'default'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #eee'
  },
  position: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px'
  },
  date: {
    fontSize: '14px',
    color: '#999'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white'
  },
  cardBody: {
    marginBottom: '20px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f5f5f5'
  },
  detailLabel: {
    fontWeight: '500',
    color: '#666'
  },
  detailValue: {
    color: '#333'
  },
  cardFooter: {
    display: 'flex',
    gap: '10px',
    paddingTop: '15px'
  },
  reportButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#FFA726',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  }
};

export default InterviewHistory;