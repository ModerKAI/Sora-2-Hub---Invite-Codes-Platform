const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files explicitly FIRST (for Vercel compatibility)
// Favicon
app.get('/favicon.ico', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'assets', 'favicon.ico');
  res.setHeader('Content-Type', 'image/x-icon');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Favicon error:', err);
      res.status(404).end();
    }
  });
});

// Assets - must be before express.static
app.get('/assets/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'assets', filename);
  const ext = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';
  
  if (ext === '.png') contentType = 'image/png';
  else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.ico') contentType = 'image/x-icon';
  else if (ext === '.svg') contentType = 'image/svg+xml';
  else if (ext === '.mp4') contentType = 'video/mp4';
  
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`Asset error for ${filename}:`, err.message);
      console.error('Full path:', filePath);
      res.status(404).end();
    }
  });
});

app.get('/assets/videos/:filename', (req, res) => {
  const filename = req.params.filename;
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(path.join(__dirname, 'public', 'assets', 'videos', filename));
});

// CSS
app.get('/css/:filename', (req, res) => {
  const filename = req.params.filename;
  res.setHeader('Content-Type', 'text/css');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(path.join(__dirname, 'public', 'css', filename));
});

// JS
app.get('/js/:filename', (req, res) => {
  const filename = req.params.filename;
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(path.join(__dirname, 'public', 'js', filename));
});

// Serve static files from public directory (fallback for other files)
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  etag: true
}));

// Simple in-memory data for demo
const freeCodes = [
  {
    id: 1,
    title: "Sora Starter Pack",
    description: "Essential codes for new users",
    available: 15,
    total: 50,
    type: "free"
  },
  {
    id: 2,
    title: "Daily Bonus",
    description: "Get your daily free code",
    available: 25,
    total: 100,
    type: "free"
  },
  {
    id: 3,
    title: "Community Gift",
    description: "Free code from our community",
    available: 8,
    total: 30,
    type: "free"
  },
  {
    id: 4,
    title: "Limited Edition Free",
    description: "Limited series free codes - grab yours now!",
    available: 12,
    total: 20,
    type: "free"
  }
];

const paidCodes = [
  {
    id: 101,
    title: "💬 Contact Manager",
    description: "Our manager will help you with all questions and Sora 2 connection. Personal support, fast responses, assistance with setup and any issues.",
    available: 999,
    total: 999,
    type: "paid",
    price: "Available 24/7",
    features: ["Help with all questions", "Sora 2 connection", "Personal support", "Fast responses"],
    button_text: "Contact Manager",
    link: "https://t.me/sora2commandos"
  },
  {
    id: 102,
    title: "👥 Buy from People",
    description: "Buy codes directly from other users in our community. Best prices, verified sellers, rating system.",
    available: 50,
    total: 50,
    type: "paid", 
    price: "From $2",
    features: ["Best prices", "Verified sellers", "Rating system", "Safe transactions"],
    button_text: "Join Chat",
    link: "https://t.me/+4RG4cpKt7wNkNGMy"
  }
];

// API Routes
app.get('/api/codes', (req, res) => {
  const type = req.query.type; // 'free', 'paid', or undefined for community codes
  
  if (type === 'free') {
    res.json({ 
      success: true,
      codes: freeCodes.map(code => ({
        ...code,
        claim_limit: code.total,
        claimed_count: code.total - code.available
      }))
    });
  } else if (type === 'paid') {
    res.json({ 
      success: true,
      codes: paidCodes.map(code => ({
        ...code,
        claim_limit: code.total,
        claimed_count: code.total - code.available
      }))
    });
  } else {
    // Return community codes (current and past)
    updateTimeAgo(); // Update time strings before sending
    
    const current = communityCodes.length > 0 ? communityCodes[currentCodeIndex] : null;
    const past = communityCodes.filter((_, index) => index !== currentCodeIndex);
    
    res.json({
      success: true,
      current: current,
      past: past
    });
  }
});

app.post('/api/codes/:id/claim', (req, res) => {
  const id = parseInt(req.params.id);
  
  // Find code in both arrays
  let code = freeCodes.find(c => c.id === id);
  let codeType = 'free';
  
  if (!code) {
    code = paidCodes.find(c => c.id === id);
    codeType = 'paid';
  }
  
  if (!code) {
    return res.status(404).json({ error: 'Code not found' });
  }
  
  if (code.available <= 0) {
    return res.status(400).json({ error: 'No codes available' });
  }
  
  // For paid codes, should check payment (simplified for demo)
  if (codeType === 'paid') {
    return res.status(400).json({ 
      error: 'This is a paid code. Please use the purchase endpoint.' 
    });
  }
  
  // Simulate claiming
  code.available--;
  
  // Generate a simple demo code
  const demoCode = `SORA-${codeType.toUpperCase()}-${String(id).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  res.json({ 
    success: true, 
    code: demoCode,
    message: 'Code claimed successfully!'
  });
});

// Purchase endpoint (demo)
app.post('/api/codes/:id/purchase', (req, res) => {
  const id = parseInt(req.params.id);
  const { paymentMethod } = req.body;
  
  const code = paidCodes.find(c => c.id === id);
  
  if (!code) {
    return res.status(404).json({ error: 'Code not found' });
  }
  
  if (code.available <= 0) {
    return res.status(400).json({ error: 'No codes available' });
  }
  
  // Simulate payment processing (always succeeds for demo)
  console.log(`Processing payment via ${paymentMethod} for code ${id}`);
  
  // Simulate claiming
  code.available--;
  
  // Generate a premium demo code
  const demoCode = `SORA-PREMIUM-${String(id).padStart(3, '0')}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  
  res.json({ 
    success: true, 
    code: demoCode,
    message: 'Purchase successful! Here is your premium code.',
    transactionId: `tx_${Math.random().toString(36).substr(2, 12)}`
  });
});

// Community codes storage (in-memory)
const communityCodes = [
  {
    id: 1,
    code: 'JOYKHF',
    status: 'fake',
    timeAgo: '2 hours ago',
    submittedBy: 'anonymous',
    feedback: { working: 2, fake: 8 },
    note: 'Found this on Discord',
    submittedAt: Date.now() - (2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: 2,
    code: 'ABC123',
    status: 'working',
    timeAgo: '4 hours ago',
    submittedBy: 'anonymous',
    feedback: { working: 15, fake: 1 },
    note: 'Working as of today!',
    submittedAt: Date.now() - (4 * 60 * 60 * 1000) // 4 hours ago
  },
  {
    id: 3,
    code: 'XYZ789',
    status: 'unknown',
    timeAgo: '6 hours ago',
    submittedBy: 'anonymous',
    feedback: { working: 3, fake: 3 },
    note: 'Not sure if this works',
    submittedAt: Date.now() - (6 * 60 * 60 * 1000) // 6 hours ago
  }
];

// Current code management
let currentCodeIndex = 0;
const CODE_DISPLAY_TIME = 10000; // 10 seconds for testing (можно изменить на 30000 для 30 секунд)

// Function to update time ago strings
function updateTimeAgo() {
  communityCodes.forEach(code => {
    const minutesAgo = Math.floor((Date.now() - code.submittedAt) / (1000 * 60));
    if (minutesAgo < 1) {
      code.timeAgo = 'Just now';
    } else if (minutesAgo < 60) {
      code.timeAgo = `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
    } else {
      const hoursAgo = Math.floor(minutesAgo / 60);
      code.timeAgo = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
    }
  });
}

// Function to rotate current code
function rotateCurrentCode() {
  if (communityCodes.length > 1) {
    currentCodeIndex = (currentCodeIndex + 1) % communityCodes.length;
  }
}

// Set up code rotation
setInterval(() => {
  updateTimeAgo();
  rotateCurrentCode();
}, CODE_DISPLAY_TIME);

// Update time strings every minute
setInterval(updateTimeAgo, 60000);

// Community codes API
app.get('/api/community-codes', (req, res) => {
  res.json({
    success: true,
    active: communityCodes.slice(0, 1), // Latest code as active
    past: communityCodes
  });
});

// Submit new community code
app.post('/api/submit-code', (req, res) => {
  const { code, note } = req.body;
  
  if (!code || code.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Code is required'
    });
  }
  
  // Check if code already exists
  const existingCode = communityCodes.find(c => 
    c.code.toLowerCase() === code.trim().toLowerCase()
  );
  
  if (existingCode) {
    return res.status(400).json({
      success: false,
      error: 'This code has already been submitted'
    });
  }
  
  // Add new code
  const newCode = {
    id: Date.now(),
    code: code.trim().toUpperCase(),
    status: 'unknown',
    timeAgo: 'Just now',
    submittedBy: 'anonymous',
    feedback: { working: 0, fake: 0 },
    note: note || '',
    submittedAt: Date.now()
  };
  
  communityCodes.unshift(newCode);
  
  // Make the new code current
  currentCodeIndex = 0;
  
  // Keep only last 50 codes
  if (communityCodes.length > 50) {
    communityCodes.length = 50;
  }
  
  res.json({
    success: true,
    message: 'Code submitted successfully!',
    code: newCode
  });
});

// Submit feedback for a code
app.post('/api/codes/:id/feedback', (req, res) => {
  const id = parseInt(req.params.id);
  const { type } = req.body; // 'working' or 'fake'
  
  const code = communityCodes.find(c => c.id === id);
  
  if (!code) {
    return res.status(404).json({
      success: false,
      error: 'Code not found'
    });
  }
  
  if (!['working', 'fake'].includes(type)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid feedback type'
    });
  }
  
  // Update feedback
  code.feedback[type]++;
  
  // Update status based on feedback ratio
  const totalFeedback = code.feedback.working + code.feedback.fake;
  if (totalFeedback >= 5) {
    const workingRatio = code.feedback.working / totalFeedback;
    if (workingRatio >= 0.7) {
      code.status = 'working';
    } else if (workingRatio <= 0.3) {
      code.status = 'fake';
    }
  }
  
  res.json({
    success: true,
    message: 'Feedback submitted!',
    code: code
  });
});

// Report a code
app.post('/api/codes/:id/report', (req, res) => {
  const id = parseInt(req.params.id);
  
  const code = communityCodes.find(c => c.id === id);
  
  if (!code) {
    return res.status(404).json({
      success: false,
      error: 'Code not found'
    });
  }
  
  // In a real app, this would flag for moderation
  console.log(`Code ${code.code} (ID: ${id}) has been reported`);
  
  res.json({
    success: true,
    message: 'Code reported. Thank you for keeping the community clean!'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sora 2 Hub backend is running!' });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Sora 2 Hub running on http://localhost:${PORT}`);
    console.log(`📋 Website available at http://localhost:${PORT}`);
    console.log(`📋 API available at http://localhost:${PORT}/api`);
    console.log(`🎁 Giveaway section with ${freeCodes.length} free codes`);
    console.log(`🛒 Marketplace section with ${paidCodes.length} paid codes`);
  });
}

// Export for Vercel
module.exports = app;