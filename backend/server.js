const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Models
const User = require('./models/User');
const Interview = require('./models/Interview');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ============= REST APIs =============

// 1. Signup API
app.post('/api/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = new User({ firstName, lastName, email, password });
    await user.save();
    
    res.status(201).json({ 
      message: 'User created successfully',
      userId: user._id 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 2. Login API
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    res.json({ 
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 3. Get User Details API
app.get('/api/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 4. Start Interview API
app.post('/api/interview/start', async (req, res) => {
  try {
    const { userId, position, experience, difficulty } = req.body;
    
    const interview = new Interview({
      userId,
      position,
      experience,
      difficulty,
      isStart: true,
      chatTranscript: []
    });
    
    await interview.save();
    
    res.status(201).json({ 
      message: 'Interview started',
      interviewId: interview._id 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 5. Stop Interview API
app.post('/api/interview/stop/:interviewId', async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(
      req.params.interviewId,
      { isStart: false },
      { new: true }
    );
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    res.json({ 
      message: 'Interview stopped',
      interview 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 6. Get User Interviews API
app.get('/api/interviews/user/:userId', async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.params.userId })
      .sort({ createdAt: -1 }); // Most recent first
    
    res.json({ 
      message: 'Interviews retrieved successfully',
      count: interviews.length,
      interviews 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 7. Generate Interview Report API
app.post('/api/interview/report/:interviewId', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Analyze the interview using Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Prepare the conversation transcript
    const transcript = interview.chatTranscript
      .map(chat => `${chat.role.toUpperCase()}: ${chat.message}`)
      .join('\n\n');
    
    const prompt = `You are an expert interview analyst. Analyze the following job interview transcript and provide a detailed performance report.

Interview Details:
- Position: ${interview.position}
- Experience Level: ${interview.experience}
- Difficulty: ${interview.difficulty}

Transcript:
${transcript}

Provide a comprehensive analysis in the following JSON format (respond ONLY with valid JSON, no additional text):
{
  "overallScore": <number between 0-100>,
  "strengths": [<array of 3-5 key strengths>],
  "weaknesses": [<array of 3-5 areas for improvement>],
  "technicalScore": <number between 0-100>,
  "communicationScore": <number between 0-100>,
  "confidenceScore": <number between 0-100>,
  "problemSolvingScore": <number between 0-100>,
  "detailedFeedback": "<comprehensive feedback paragraph>",
  "recommendations": [<array of 3-5 specific recommendations>],
  "questionsAsked": <number of questions asked by interviewer>,
  "answersGiven": <number of answers given by candidate>,
  "averageResponseLength": "<short/medium/long>",
  "interviewDuration": "<estimated duration based on conversation>",
  "performanceLevel": "<Excellent/Good/Average/Needs Improvement>"
}`;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();
    
    // Parse the JSON response
    let reportData;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      reportData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      // If parsing fails, return a default structure
      reportData = {
        overallScore: 70,
        strengths: ["Completed the interview", "Responded to questions", "Showed engagement"],
        weaknesses: ["Could provide more detailed responses"],
        technicalScore: 70,
        communicationScore: 70,
        confidenceScore: 70,
        problemSolvingScore: 70,
        detailedFeedback: "The interview was conducted successfully. Continue practicing to improve your skills.",
        recommendations: ["Practice more technical questions", "Improve response clarity", "Research the company thoroughly"],
        questionsAsked: interview.chatTranscript.filter(c => c.role === 'ai').length,
        answersGiven: interview.chatTranscript.filter(c => c.role === 'user').length,
        averageResponseLength: "medium",
        interviewDuration: "15-20 minutes",
        performanceLevel: "Good"
      };
    }
    
    // Add interview details to the report
    const fullReport = {
      interviewId: interview._id,
      position: interview.position,
      experience: interview.experience,
      difficulty: interview.difficulty,
      interviewDate: interview.createdAt,
      ...reportData
    };
    
    res.json({ 
      message: 'Report generated successfully',
      report: fullReport
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
});

// ============= Socket.IO for Real-time Interview =============

io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);
  
  // Join interview room
  socket.on('join-interview', async (data) => {
    const { interviewId } = data;
    socket.join(interviewId);
    console.log(`User joined interview: ${interviewId}`);
    
    // Send initial greeting
    const interview = await Interview.findById(interviewId);
    const greeting = `Hello! I'm your AI interviewer. You're interviewing for the ${interview.position} position. Let me introduce myself and we'll begin with some questions. Are you ready?`;
    
    socket.emit('ai-response', { message: greeting });
  });
  
  // Handle user's voice/text message
  socket.on('user-message', async (data) => {
    try {
      const { interviewId, message } = data;
      
      // Save user message to database
      await Interview.findByIdAndUpdate(interviewId, {
        $push: {
          chatTranscript: {
            role: 'user',
            message: message,
            timestamp: new Date()
          }
        }
      });
      
      // Get interview context
      const interview = await Interview.findById(interviewId);
      
      // Generate AI response using Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `You are an AI interviewer conducting a ${interview.difficulty} level interview for a ${interview.position} position for someone with ${interview.experience} experience.
      
User said: "${message}"

Respond professionally as an interviewer. Ask relevant technical or behavioral questions based on the position. Keep responses concise and conversational.`;
      
      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text();
      
      // Save AI response to database
      await Interview.findByIdAndUpdate(interviewId, {
        $push: {
          chatTranscript: {
            role: 'ai',
            message: aiResponse,
            timestamp: new Date()
          }
        }
      });
      
      // Send AI response back to user
      socket.emit('ai-response', { message: aiResponse });
      
    } catch (error) {
      console.error('Error:', error);
      socket.emit('error', { message: 'Something went wrong' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});