import React, { useEffect, useRef, useState } from 'react';

const STEP_KEYWORDS = [
  { key: 'Step 1', label: 'Tailoring resume to JD', icon: '✏️' },
  { key: 'Step 2', label: 'Exporting v1 PDF + DOCX', icon: '📄' },
  { key: 'Step 3', label: 'Scoring ATS keywords', icon: '📊' },
  { key: 'Step 4', label: 'Fixing gaps → v2', icon: '🔧' },
  { key: 'Step 5', label: 'Compressing to 2 pages', icon: '📐' },
  { key: 'Step 6', label: 'Re-scoring final resume', icon: '✅' },
  { key: 'Step 7', label: 'Generating interview prep', icon: '🎯' },
  { key: 'Step 8', label: 'Sending email delivery', icon: '📧' },
];

export default function PipelineRunner({ jobId, onDone, onFail }) {
  const [logs, setLogs] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [failed, setFailed] = useState(false);
  const logsEndRef = useRef(null);

  useEffect(() => {
    const es = new EventSource(`/api/logs/${jobId}`);

    es.onmessage = (e) => {
      const msg = JSON.parse(e.data);

      if (msg.type === 'done') {
        es.close();
        onDone(msg.files);
        return;
      }

      if (msg.type === 'failed') {
        es.close();
        setFailed(true);
        return;
      }

      if (msg.type === 'log' || msg.type === 'error') {
        setLogs(prev => [...prev, { ...msg, id: Date.now() + Math.random() }]);

        // Detect active step from log text
        STEP_KEYWORDS.forEach((s, i) => {
          if (msg.text && msg.text.includes(s.key)) setActiveStep(i);
        });
      }
    };

    es.onerror = () => { es.close(); setFailed(true); };
    return () => es.close();
  }, [jobId, onDone]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div>
      {/* Step progress */}
      <div className="card">
        <div className="card-title">🔄 Pipeline Running</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {STEP_KEYWORDS.map((s, i) => (
            <div key={s.key} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderRadius: 8,
              background: i < activeStep ? 'var(--accent-light)' : i === activeStep ? 'var(--primary-light)' : '#f8f9fb',
              border: i === activeStep ? '1px solid #b5d4f4' : '1px solid transparent',
              transition: 'all 0.3s'
            }}>
              <span style={{ fontSize: 16 }}>{i < activeStep ? '✅' : i === activeStep ? '⏳' : '⬜'}</span>
              <span style={{ fontSize: 13, fontWeight: i === activeStep ? 600 : 400, color: i < activeStep ? 'var(--accent)' : i === activeStep ? 'var(--primary)' : 'var(--muted)' }}>
                {s.icon} {s.label}
              </span>
              {i === activeStep && (
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--primary)', animation: 'pulse 1.5s infinite' }}>
                  running…
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live log terminal */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="card-title">🖥️ Live Output</div>
        <div style={{
          background: '#0f1117', borderRadius: 8, padding: '1rem',
          fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6,
          maxHeight: 300, overflowY: 'auto', color: '#c9d1d9'
        }}>
          {logs.length === 0 && (
            <span style={{ color: '#666' }}>Waiting for output…</span>
          )}
          {logs.map(log => (
            <div key={log.id} style={{ color: log.type === 'error' ? '#ff7b72' : '#7ee787' }}>
              <span style={{ color: '#555', marginRight: 8 }}>›</span>
              {log.text}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>

      {failed && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ padding: '12px 16px', background: 'var(--danger-light)', borderRadius: 8, fontSize: 14, color: 'var(--danger)', marginBottom: 12 }}>
            ⚠️ Pipeline failed. Check the log above for details. Make sure the Python environment is set up correctly.
          </div>
          <button className="btn btn-outline" onClick={onFail}>← Try Again</button>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
