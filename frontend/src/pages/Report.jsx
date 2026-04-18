import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Report() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    generateReport();
  }, [interviewId]);

  const generateReport = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`https://ai-interviewer-6djd.onrender.com/api/interview/report/${interviewId}`);
      setReport(response.data.report);
      setLoading(false);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report. Please try again.');
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFA726';
    return '#f44336';
  };

  const getPerformanceColor = (level) => {
    const colors = {
      'Excellent': '#4CAF50',
      'Good': '#66BB6A',
      'Average': '#FFA726',
      'Needs Improvement': '#f44336'
    };
    return colors[level] || '#999';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <h2 style={styles.loadingText}>Generating your report...</h2>
        <p style={styles.loadingSubtext}>AI is analyzing your interview performance</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button style={styles.backButton} onClick={() => navigate('/history')}>
          Back to History
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={styles.errorContainer}>
        <h2>No Report Available</h2>
        <button style={styles.backButton} onClick={() => navigate('/history')}>
          Back to History
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>📊 Interview Performance Report</h1>
        <button style={styles.headerButton} onClick={() => navigate('/history')}>
          ← Back to History
        </button>
      </div>

      <div style={styles.content}>
        {/* Interview Info Card */}
        <div style={styles.infoCard}>
          <h2 style={styles.cardTitle}>Interview Details</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Position:</span>
              <span style={styles.infoValue}>{report.position}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Experience:</span>
              <span style={styles.infoValue}>{report.experience}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Difficulty:</span>
              <span style={styles.infoValue}>{report.difficulty}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Date:</span>
              <span style={styles.infoValue}>
                {new Date(report.interviewDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Overall Score Card */}
        <div style={styles.scoreCard}>
          <h2 style={styles.cardTitle}>Overall Performance</h2>
          <div style={styles.overallScoreContainer}>
            <div style={styles.scoreCircle}>
              <svg width="200" height="200" style={styles.svg}>
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke={getScoreColor(report.overallScore)}
                  strokeWidth="20"
                  strokeDasharray={`${(report.overallScore / 100) * 502.4} 502.4`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div style={styles.scoreText}>
                <div style={styles.scoreNumber}>{report.overallScore}</div>
                <div style={styles.scoreLabel}>/ 100</div>
              </div>
            </div>
            <div style={styles.performanceBadge}>
              <div 
                style={{
                  ...styles.performanceLevel,
                  backgroundColor: getPerformanceColor(report.performanceLevel)
                }}
              >
                {report.performanceLevel}
              </div>
            </div>
          </div>
        </div>

        {/* Scores Breakdown */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Score Breakdown</h2>
          <div style={styles.scoresGrid}>
            {[
              { label: 'Technical Skills', score: report.technicalScore },
              { label: 'Communication', score: report.communicationScore },
              { label: 'Confidence', score: report.confidenceScore },
              { label: 'Problem Solving', score: report.problemSolvingScore }
            ].map((item, index) => (
              <div key={index} style={styles.scoreItem}>
                <div style={styles.scoreItemHeader}>
                  <span style={styles.scoreItemLabel}>{item.label}</span>
                  <span 
                    style={{
                      ...styles.scoreItemValue,
                      color: getScoreColor(item.score)
                    }}
                  >
                    {item.score}%
                  </span>
                </div>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${item.score}%`,
                      backgroundColor: getScoreColor(item.score)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths and Weaknesses */}
        <div style={styles.twoColumnGrid}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>💪 Strengths</h2>
            <ul style={styles.list}>
              {report.strengths.map((strength, index) => (
                <li key={index} style={styles.listItem}>
                  <span style={styles.checkmark}>✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📈 Areas for Improvement</h2>
            <ul style={styles.list}>
              {report.weaknesses.map((weakness, index) => (
                <li key={index} style={styles.listItem}>
                  <span style={styles.bullet}>•</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Detailed Feedback */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📝 Detailed Feedback</h2>
          <p style={styles.feedback}>{report.detailedFeedback}</p>
        </div>

        {/* Recommendations */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🎯 Recommendations</h2>
          <div style={styles.recommendationsList}>
            {report.recommendations.map((recommendation, index) => (
              <div key={index} style={styles.recommendationItem}>
                <div style={styles.recommendationNumber}>{index + 1}</div>
                <div style={styles.recommendationText}>{recommendation}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Interview Statistics */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📊 Interview Statistics</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{report.questionsAsked}</div>
              <div style={styles.statLabel}>Questions Asked</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{report.answersGiven}</div>
              <div style={styles.statLabel}>Answers Given</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{report.averageResponseLength}</div>
              <div style={styles.statLabel}>Avg Response Length</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{report.interviewDuration}</div>
              <div style={styles.statLabel}>Duration</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <button 
            style={styles.printButton}
            onClick={() => window.print()}
          >
            🖨️ Print Report
          </button>
          <button 
            style={styles.newInterviewButton}
            onClick={() => navigate('/dashboard')}
          >
            🎤 Start New Interview
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    paddingBottom: '60px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5'
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '6px solid #e0e0e0',
    borderTop: '6px solid #2196F3',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  loadingText: {
    color: '#333',
    marginBottom: '10px'
  },
  loadingSubtext: {
    color: '#666',
    fontSize: '14px'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5'
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
  headerButton: {
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
  infoCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  scoreCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  infoLabel: {
    fontSize: '12px',
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  infoValue: {
    fontSize: '16px',
    color: '#333',
    fontWeight: '500'
  },
  overallScoreContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px'
  },
  scoreCircle: {
    position: 'relative',
    width: '200px',
    height: '200px'
  },
  svg: {
    transform: 'rotate(-90deg)'
  },
  scoreText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center'
  },
  scoreNumber: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#333'
  },
  scoreLabel: {
    fontSize: '16px',
    color: '#999'
  },
  performanceBadge: {
    marginTop: '10px'
  },
  performanceLevel: {
    padding: '10px 30px',
    borderRadius: '25px',
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  scoresGrid: {
    display: 'grid',
    gap: '20px'
  },
  scoreItem: {
    marginBottom: '10px'
  },
  scoreItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  scoreItemLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  scoreItemValue: {
    fontSize: '16px',
    fontWeight: 'bold'
  },
  progressBar: {
    width: '100%',
    height: '12px',
    backgroundColor: '#e0e0e0',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '6px',
    transition: 'width 0.3s ease'
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  listItem: {
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    alignItems: 'start',
    gap: '10px',
    fontSize: '14px',
    lineHeight: '1.6'
  },
  checkmark: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: '18px',
    flexShrink: 0
  },
  bullet: {
    color: '#FFA726',
    fontWeight: 'bold',
    fontSize: '18px',
    flexShrink: 0
  },
  feedback: {
    fontSize: '15px',
    lineHeight: '1.8',
    color: '#555'
  },
  recommendationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  recommendationItem: {
    display: 'flex',
    gap: '15px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    alignItems: 'start'
  },
  recommendationNumber: {
    width: '30px',
    height: '30px',
    backgroundColor: '#2196F3',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    flexShrink: 0
  },
  recommendationText: {
    flex: 1,
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#333'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px'
  },
  statBox: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    textTransform: 'uppercase'
  },
  actionButtons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginTop: '30px'
  },
  printButton: {
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  newInterviewButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  backButton: {
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '20px'
  }
};

// Add CSS animation for spinner
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media print {
    button {
      display: none !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Report;