import React, { useState } from 'react';
import PipelineForm from './pages/PipelineForm';
import PipelineRunner from './pages/PipelineRunner';
import Results from './pages/Results';
import './App.css';

export default function App() {
  const [stage, setStage] = useState('form'); // form | running | results
  const [jobId, setJobId] = useState(null);
  const [results, setResults] = useState(null);

  const handleStart = (id) => { setJobId(id); setStage('running'); };
  const handleDone = (files) => { setResults(files); setStage('results'); };
  const handleReset = () => { setStage('form'); setJobId(null); setResults(null); };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🚀</span>
            <span className="logo-text">job-hunt-ai</span>
          </div>
          <p className="tagline">AI-powered resume tailoring, ATS scoring & interview prep</p>
        </div>
      </header>

      <main className="app-main">
        <div className="stepper">
          {['Setup', 'Running', 'Results'].map((s, i) => {
            const idx = ['form','running','results'].indexOf(stage);
            return (
              <div key={s} className={`step ${i <= idx ? 'active' : ''} ${i < idx ? 'done' : ''}`}>
                <div className="step-dot">{i < idx ? '✓' : i + 1}</div>
                <span>{s}</span>
              </div>
            );
          })}
        </div>

        {stage === 'form' && <PipelineForm onStart={handleStart} />}
        {stage === 'running' && <PipelineRunner jobId={jobId} onDone={handleDone} onFail={handleReset} />}
        {stage === 'results' && <Results files={results} onReset={handleReset} />}
      </main>
    </div>
  );
}
