import React from 'react';

const FILE_META = {
  'resume_final.pdf':    { icon: '📄', label: 'Final Resume (PDF)',       desc: '2-page ATS-optimized', highlight: true },
  'resume_final.docx':  { icon: '📝', label: 'Final Resume (Word)',       desc: 'Editable DOCX format', highlight: true },
  'interview_prep.pdf': { icon: '🎯', label: 'Interview Prep (PDF)',      desc: '20+ Q&A grounded in your resume', highlight: true },
  'interview_prep.docx':{ icon: '📋', label: 'Interview Prep (Word)',     desc: 'Editable DOCX format', highlight: true },
  'resume_v1.pdf':      { icon: '📄', label: 'Resume v1 (PDF)',           desc: 'First tailored version' },
  'resume_v1.docx':     { icon: '📝', label: 'Resume v1 (Word)',          desc: 'First tailored version' },
  'resume_v2.pdf':      { icon: '📄', label: 'Resume v2 (PDF)',           desc: 'Gap-fixed version' },
  'resume_v2.docx':     { icon: '📝', label: 'Resume v2 (Word)',          desc: 'Gap-fixed version' },
};

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function Results({ files, onReset }) {
  const highlighted = files?.filter(f => FILE_META[f.name]?.highlight) || [];
  const others = files?.filter(f => !FILE_META[f.name]?.highlight) || [];

  return (
    <div>
      {/* Success banner */}
      <div style={{
        background: 'var(--accent-light)', border: '1px solid #9fe1cb',
        borderRadius: 'var(--radius, 10px)', padding: '1.25rem 1.5rem',
        marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 12
      }}>
        <span style={{ fontSize: 28 }}>🎉</span>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: 2 }}>Pipeline complete!</div>
          <div style={{ fontSize: 13, color: '#374151' }}>
            Your resume is tailored, scored, compressed to 2 pages, and interview prep is ready.
          </div>
        </div>
      </div>

      {/* Primary deliverables */}
      <div className="card">
        <div className="card-title">⬇️ Your Deliverables</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {highlighted.map(file => {
            const meta = FILE_META[file.name] || {};
            return (
              <a
                key={file.name}
                href={file.url}
                download={file.name}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 8,
                  border: '1.5px solid var(--primary)', background: 'var(--primary-light)',
                  transition: 'all 0.15s', cursor: 'pointer'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#d0e6f8'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--primary-light)'}
                >
                  <span style={{ fontSize: 22 }}>{meta.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {meta.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{meta.desc} · {formatSize(file.size)}</div>
                  </div>
                  <span style={{ fontSize: 16, color: 'var(--primary)' }}>⬇</span>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Intermediate files */}
      {others.length > 0 && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="card-title" style={{ fontSize: 13, color: 'var(--muted)' }}>📁 All Files</div>
          {others.map(file => {
            const meta = FILE_META[file.name] || { icon: '📄', label: file.name, desc: '' };
            return (
              <a key={file.name} href={file.url} download={file.name} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: '1px solid var(--border)',
                  cursor: 'pointer'
                }}>
                  <span>{meta.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#374151' }}>{meta.label || file.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{meta.desc} · {formatSize(file.size)}</div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--primary)' }}>Download</span>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Next steps */}
      <div className="card" style={{ marginTop: '1rem', background: '#fafafa' }}>
        <div className="card-title" style={{ fontSize: 13 }}>💡 Next Steps</div>
        <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.8 }}>
          <div>1. Review your tailored resume and make any personal tweaks</div>
          <div>2. Study the interview prep guide — especially the system design question</div>
          <div>3. Practice the PL/SQL and API design questions out loud</div>
          <div>4. Apply with the final resume PDF — it's ATS-optimized and 2 pages</div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: 12 }}>
        <button className="btn btn-outline" onClick={onReset}>
          ← Run for Another Job
        </button>
      </div>
    </div>
  );
}
