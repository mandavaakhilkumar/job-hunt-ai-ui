import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

export default function PipelineForm({ onStart }) {
  const [resume, setResume] = useState(null);
  const [jd, setJd] = useState('');
  const [email, setEmail] = useState('');
  const [skipEmail, setSkipEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) setResume(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleSubmit = async () => {
    setError('');
    if (!resume) return setError('Please upload your resume PDF.');
    if (!jd.trim()) return setError('Please paste the job description.');
    if (!skipEmail && !email.trim()) return setError('Enter an email or check "Skip email delivery".');

    setLoading(true);
    try {
      const form = new FormData();
      form.append('resume', resume);
      form.append('jd', jd);
      form.append('email', email);
      form.append('skipEmail', String(skipEmail));

      const { data } = await axios.post('/api/run', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onStart(data.jobId);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to start pipeline. Is the server running?');
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Resume Upload */}
      <div className="card">
        <div className="card-title">📄 Your Resume</div>
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active' : ''} ${resume ? 'has-file' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="dropzone-icon">{resume ? '✅' : '📎'}</div>
          {resume ? (
            <>
              <div className="dropzone-filename">{resume.name}</div>
              <div className="dropzone-text" style={{ marginTop: 4 }}>
                {(resume.size / 1024).toFixed(0)} KB — click to replace
              </div>
            </>
          ) : (
            <>
              <div className="dropzone-text">Drag & drop your resume PDF here</div>
              <div className="dropzone-text" style={{ marginTop: 4, fontSize: 12 }}>or click to browse</div>
            </>
          )}
        </div>
      </div>

      {/* Job Description */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="card-title">📋 Job Description</div>
        <div className="field">
          <label>Paste the full job description</label>
          <textarea
            value={jd}
            onChange={e => setJd(e.target.value)}
            placeholder="Copy and paste the entire job posting here — title, responsibilities, requirements, everything..."
            rows={10}
          />
          <div className="field-hint">
            {jd.length > 0 ? `${jd.split(/\s+/).filter(Boolean).length} words` : 'The more complete, the better the tailoring'}
          </div>
        </div>
      </div>

      {/* Email & Options */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="card-title">⚙️ Options</div>

        <div className="toggle-row">
          <input
            type="checkbox"
            id="skipEmail"
            checked={skipEmail}
            onChange={e => setSkipEmail(e.target.checked)}
          />
          <label htmlFor="skipEmail">Skip email delivery — just download files directly</label>
        </div>

        {!skipEmail && (
          <div className="field">
            <label>Delivery email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@gmail.com"
            />
            <div className="field-hint">Resume PDF, DOCX, interview prep PDF & DOCX will be sent here</div>
          </div>
        )}
      </div>

      {/* Summary & launch */}
      {(resume || jd) && (
        <div className="card" style={{ marginTop: '1rem', background: 'var(--primary-light)', border: '1px solid #b5d4f4' }}>
          <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500, marginBottom: 8 }}>Pipeline will run:</div>
          <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
            {['Tailor resume to JD', 'Export v1 PDF + DOCX', 'Score ATS keywords', 'Fix all gaps → v2', 'Compress to 2 pages', 'Re-score final', 'Generate interview prep', skipEmail ? 'Save files locally' : `Email to ${email || '…'}`]
              .map((s, i) => <div key={i}>Step {i + 1}: {s}</div>)}
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '1rem', padding: '10px 14px', background: 'var(--danger-light)', border: '1px solid #f09595', borderRadius: 8, fontSize: 13, color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading || !resume || !jd.trim()}
          style={{ padding: '12px 32px', fontSize: 15 }}
        >
          {loading ? 'Starting…' : '🚀 Run Pipeline'}
        </button>
      </div>
    </div>
  );
}
