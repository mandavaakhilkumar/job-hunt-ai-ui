require('dotenv').config({ path: require('path').join(__dirname, '..', '..', 'job-hunt-ai', '.env') });
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Storage for uploaded files
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

// SSE clients for streaming logs
const sseClients = new Map();

// Ensure dirs exist
['uploads', 'outputs'].forEach(dir => {
  const p = path.join(__dirname, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// ── SSE endpoint for live pipeline logs ────────────────────────────────────
app.get('/api/logs/:jobId', (req, res) => {
  const { jobId } = req.params;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.set(jobId, res);
  req.on('close', () => sseClients.delete(jobId));
});

function sendLog(jobId, data) {
  const client = sseClients.get(jobId);
  if (client) client.write(`data: ${JSON.stringify(data)}\n\n`);
}

// ── Run pipeline ────────────────────────────────────────────────────────────
app.post('/api/run', upload.single('resume'), async (req, res) => {
  console.log('📝 POST /api/run received');
  const { jd, email, skipEmail } = req.body;
  const jobId = `job_${Date.now()}`;

  if (!req.file) {
    console.log('❌ No resume file');
    return res.status(400).json({ error: 'Resume PDF required' });
  }
  if (!jd) {
    console.log('❌ No JD text');
    return res.status(400).json({ error: 'Job description required' });
  }

  console.log(`✅ Upload OK. jobId: ${jobId}, email: ${email}`);

  // Save JD to temp file
  const jdPath = path.join(__dirname, 'uploads', `${jobId}_jd.txt`);
  fs.writeFileSync(jdPath, jd);

  const resumePath = req.file.path;
  const outputDir = path.join(__dirname, 'outputs', jobId);
  fs.mkdirSync(outputDir, { recursive: true });

  res.json({ jobId });

  // Build Python args
  const jobHuntAiDir = path.join(__dirname, '..', '..', 'job-hunt-ai');
  const args = [
    path.join(jobHuntAiDir, 'main.py'),
    '--resume', resumePath,
    '--jd', jdPath,
    '--output-dir', outputDir,
  ];
  if (email) args.push('--email', email);
  if (skipEmail === 'true') args.push('--skip-email');

  console.log(`🐍 Running: python ${args[0]}`);

  const py = spawn('python', ['-u', ...args], {
    shell: true,
    env: {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      PYTHONUTF8: '1',
      PYTHONUNBUFFERED: '1',
      SystemRoot: process.env.SystemRoot || 'C:\\Windows',
      SYSTEMROOT: process.env.SYSTEMROOT || 'C:\\Windows',
    },
    cwd: jobHuntAiDir
  });

  py.on('error', (err) => {
    console.error(`❌ Python error:`, err);
    console.error(`   Code: ${err.code}`);
    console.error(`   Message: ${err.message}`);
    console.error(`   Path: ${err.path}`);
    sendLog(jobId, { type: 'error', text: `Failed to start Python: ${err.message}` });
  });

  py.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean);
    lines.forEach(line => {
      console.log(`[${jobId}] ${line}`);
      sendLog(jobId, { type: 'log', text: line });
    });
  });

  py.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean);
    lines.forEach(line => {
      console.error(`[${jobId}] ${line}`);
      sendLog(jobId, { type: 'error', text: line });
    });
  });

  py.on('close', (code) => {
    if (code === 0) {
      // Collect output files
      const files = fs.readdirSync(outputDir).map(f => ({
        name: f,
        url: `/api/download/${jobId}/${f}`,
        size: fs.statSync(path.join(outputDir, f)).size
      }));
      sendLog(jobId, { type: 'done', files });
    } else {
      sendLog(jobId, { type: 'failed', code });
    }
    // Cleanup uploads
    fs.unlinkSync(resumePath);
    fs.unlinkSync(jdPath);
  });
});

// ── Download output files ───────────────────────────────────────────────────
app.get('/api/download/:jobId/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'outputs', req.params.jobId, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  res.download(filePath);
});

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', port: PORT }));

app.listen(PORT, () => console.log(`🚀 job-hunt-ai server running on http://localhost:${PORT}`));
