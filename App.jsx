import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════
   PROBLEM GENERATORS
   ═══════════════════════════════════════════════════ */

const TYPES = ["addition", "subtraction", "multiplication", "division", "percentage", "squares"];
const TYPE_LABELS = {
  addition: "Addition", subtraction: "Subtraction", multiplication: "Multiplication",
  division: "Division", percentage: "Percentages", squares: "Squares & Roots", mixed: "Mixed Bag"
};
const TYPE_ICONS = {
  addition: "+", subtraction: "−", multiplication: "×",
  division: "÷", percentage: "%", squares: "x²", mixed: "⚡"
};
const ALL_TYPES = [...TYPES, "mixed"];

function generateProblem(type, difficulty) {
  const d = difficulty;
  const pick = type === "mixed" ? TYPES[Math.floor(Math.random() * TYPES.length)] : type;
  let a, b, question, answer;

  switch (pick) {
    case "addition": {
      const max = [20, 100, 999][d - 1];
      const min = [1, 10, 50][d - 1];
      a = Math.floor(Math.random() * (max - min)) + min;
      b = Math.floor(Math.random() * (max - min)) + min;
      question = `${a} + ${b}`;
      answer = a + b;
      break;
    }
    case "subtraction": {
      const max = [20, 100, 999][d - 1];
      const min = [1, 10, 50][d - 1];
      a = Math.floor(Math.random() * (max - min)) + min;
      b = Math.floor(Math.random() * a) + 1;
      question = `${a} − ${b}`;
      answer = a - b;
      break;
    }
    case "multiplication": {
      const maxA = [12, 20, 50][d - 1];
      const maxB = [12, 15, 30][d - 1];
      a = Math.floor(Math.random() * maxA) + 2;
      b = Math.floor(Math.random() * maxB) + 2;
      question = `${a} × ${b}`;
      answer = a * b;
      break;
    }
    case "division": {
      const maxDiv = [12, 20, 30][d - 1];
      b = Math.floor(Math.random() * maxDiv) + 2;
      answer = Math.floor(Math.random() * maxDiv) + 1;
      a = b * answer;
      question = `${a} ÷ ${b}`;
      break;
    }
    case "percentage": {
      const percs = d === 1 ? [10, 20, 25, 50] : d === 2 ? [5, 10, 15, 20, 25, 30, 50, 75] : [7, 8, 12, 15, 17, 22, 33, 40, 60, 75, 80];
      const p = percs[Math.floor(Math.random() * percs.length)];
      const bases = d === 1 ? [20, 40, 50, 100, 200] : d === 2 ? [60, 80, 120, 150, 200, 250, 300] : [44, 75, 120, 180, 240, 350, 480, 600];
      a = bases[Math.floor(Math.random() * bases.length)];
      question = `${p}% of ${a}`;
      answer = (p / 100) * a;
      break;
    }
    case "squares": {
      if (d === 1) {
        a = Math.floor(Math.random() * 12) + 2;
        question = `${a}²`;
        answer = a * a;
      } else if (d === 2) {
        a = Math.floor(Math.random() * 20) + 5;
        question = `${a}²`;
        answer = a * a;
      } else {
        const perfect = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400, 441, 484, 529, 576, 625];
        a = perfect[Math.floor(Math.random() * perfect.length)];
        question = `√${a}`;
        answer = Math.sqrt(a);
      }
      break;
    }
    default: return generateProblem("addition", d);
  }
  return { question, answer: Math.round(answer * 100) / 100, type: pick, difficulty: d };
}

/* ═══════════════════════════════════════════════════
   MENTAL MATH TIPS DATABASE
   ═══════════════════════════════════════════════════ */

const TIPS = {
  addition: [
    { title: "Left-to-Right Addition", tip: "Add from left to right instead of right to left. For 347 + 285: 300+200=500, 40+80=120, 7+5=12 → 632. This keeps the big picture in mind." },
    { title: "Round & Compensate", tip: "Round one number up, add, then subtract the difference. 67 + 38 → 67 + 40 - 2 = 105. Much easier!" },
    { title: "Bridge Through 10s", tip: "Split a number to reach the nearest 10 first. 46 + 7 → 46 + 4 + 3 = 53. Tens boundaries are mental anchors." },
    { title: "Pair Complements", tip: "Look for pairs that make 10 or 100. In 37 + 48 + 63, notice 37+63=100, then +48=148." },
  ],
  subtraction: [
    { title: "Add to Subtract", tip: "Instead of 83-47, ask: what do I add to 47 to reach 83? 47+3=50, 50+33=83, so 3+33=36." },
    { title: "Round the Subtrahend", tip: "Round up what you're subtracting. 92-38 → 92-40+2 = 54. Subtracting round numbers is trivial." },
    { title: "Constant Difference", tip: "Add the same to both numbers. 71-36 → 75-40 = 35. Keep the difference, simplify the numbers." },
    { title: "Break Apart Method", tip: "Subtract in parts: 524-167 → 524-100=424, 424-60=364, 364-7=357." },
  ],
  multiplication: [
    { title: "Break & Distribute", tip: "Split one factor. 14×7 → (10×7)+(4×7) = 70+28 = 98. Use the distributive property!" },
    { title: "Double & Halve", tip: "Make one factor easier. 25×16 → 50×8 = 400. Keep doubling one and halving the other." },
    { title: "Multiply by 11 Trick", tip: "For 2-digit × 11: put the sum of digits in the middle. 36×11: 3_(3+6)_6 = 396. Carry if sum > 9." },
    { title: "Near-Squares Pattern", tip: "For numbers near each other: 19×21 = 20²-1² = 400-1 = 399. Use (a+b)(a-b) = a²-b²." },
    { title: "×5 Shortcut", tip: "Multiply by 10 then halve. 48×5 = 480÷2 = 240. Or halve first: 48÷2×10 = 240." },
  ],
  division: [
    { title: "Factor the Divisor", tip: "Break divisor into factors. 144÷12 → 144÷4÷3 = 36÷3 = 12. Chain simple divisions." },
    { title: "Multiply to Divide", tip: "Ask: divisor × what = dividend? For 156÷12, think 12×13=156, so answer is 13." },
    { title: "Use Known Facts", tip: "Anchor to nearby facts. 170÷15: I know 15×10=150, need 20 more, 15×1=15… so ~11 remainder 5." },
    { title: "÷5 Shortcut", tip: "Double the number, then divide by 10. 135÷5 = 270÷10 = 27." },
  ],
  percentage: [
    { title: "Flip the Percent", tip: "x% of y = y% of x. So 8% of 50 = 50% of 8 = 4. Always pick the easier direction!" },
    { title: "Break into Parts", tip: "15% = 10% + 5%. For 15% of 240: 10%=24, 5%=12, total=36. Build from easy percentages." },
    { title: "1% Then Scale", tip: "Find 1% first (move decimal 2 places left), then multiply. 7% of 300: 1%=3, 7%=21." },
    { title: "Fraction Equivalents", tip: "25%=¼, 33%≈⅓, 20%=⅕, 12.5%=⅛. Use fractions when they're cleaner. 25% of 88 = 88÷4 = 22." },
  ],
  squares: [
    { title: "Near a Known Square", tip: "(n+1)² = n² + 2n + 1. Know 15²=225? Then 16² = 225+30+1 = 256. Step from anchors." },
    { title: "Ends-in-5 Trick", tip: "For n5²: multiply n×(n+1), append 25. So 35² → 3×4=12, append 25 → 1225." },
    { title: "Difference of Squares", tip: "23² = (20+3)² = 400+120+9 = 529. Or use 23² = 25×21 + 4 = 525+4 = 529." },
    { title: "Square Root Estimation", tip: "Find the nearest perfect squares above and below. √50 is between 7²=49 and 8²=64, so √50 ≈ 7.07." },
  ],
};

/* ═══════════════════════════════════════════════════
   TRAINING MODES
   ═══════════════════════════════════════════════════ */

const MODES = {
  speed:    { label: "Speed Blitz",  icon: "⚡", desc: "60 seconds of rapid fire. How many can you nail?",            time: 60,   problems: 999 },
  accuracy: { label: "Precision",    icon: "🎯", desc: "20 problems, unlimited time. Pure correctness matters.",       time: null, problems: 20  },
  stamina:  { label: "Endurance",    icon: "🏔️", desc: "100 problems. Watch how your performance holds up over time.", time: null, problems: 100 },
};

/* ═══════════════════════════════════════════════════
   LOCAL STORAGE HELPERS
   ═══════════════════════════════════════════════════ */

const STORAGE_KEY = "mathlete-stats-v1";

function emptyTypeStats() {
  const s = {};
  TYPES.forEach(t => { s[t] = { attempts: 0, correct: 0, totalTime: 0, times: [] }; });
  return s;
}

function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function saveStats(stats) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch (e) {}
}

/* ═══════════════════════════════════════════════════
   MAIN APP COMPONENT
   ═══════════════════════════════════════════════════ */

export default function App() {
  // ── Global ──
  const [screen, setScreen] = useState("home");
  const [allTimeStats, setAllTimeStats] = useState(() =>
    loadStats() || { sessions: 0, totalProblems: 0, totalCorrect: 0, byType: emptyTypeStats() }
  );

  // ── Session config ──
  const [mode, setMode] = useState(null);
  const [problemType, setProblemType] = useState("mixed");
  const [difficulty, setDifficulty] = useState(2);

  // ── Training state ──
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [problemIndex, setProblemIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [problemStartTime, setProblemStartTime] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [showFeedback, setShowFeedback] = useState(null);
  const [feedbackAnswer, setFeedbackAnswer] = useState(null);
  const [shownTips, setShownTips] = useState([]);
  const [showTipModal, setShowTipModal] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const resultsRef = useRef([]);

  // Keep a ref in sync so callbacks always read current results
  useEffect(() => { resultsRef.current = sessionResults; }, [sessionResults]);

  // Persist stats
  useEffect(() => { saveStats(allTimeStats); }, [allTimeStats]);

  // ── Countdown ──
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 700);
      return () => clearTimeout(t);
    }
    if (countdown === 0) {
      setCountdown(null);
      beginSession();
    }
  }, [countdown]);

  // ── Speed timer ──
  useEffect(() => {
    if (sessionActive && mode === "speed" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timerRef.current);
    }
    if (sessionActive && mode === "speed" && timeLeft === 0) {
      endSession(resultsRef.current);
    }
  }, [sessionActive, timeLeft, mode]);

  // ── Autofocus ──
  useEffect(() => {
    if (sessionActive && inputRef.current && !showFeedback) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [sessionActive, currentProblem, showFeedback]);

  // ── Actions ──
  function startSetup(m) { setMode(m); setScreen("setup"); }

  function startCountdown() {
    setCountdown(3);
    setScreen("training");
    setSessionResults([]);
    resultsRef.current = [];
    setProblemIndex(0);
    setUserAnswer("");
    setShowFeedback(null);
    setShownTips([]);
  }

  function beginSession() {
    const p = generateProblem(problemType, difficulty);
    setCurrentProblem(p);
    setProblemStartTime(Date.now());
    setTimeLeft(MODES[mode]?.time || null);
    setSessionActive(true);
  }

  function submitAnswer() {
    if (!userAnswer.trim() || showFeedback) return;
    const elapsed = (Date.now() - problemStartTime) / 1000;
    const numAnswer = parseFloat(userAnswer);
    const correct = Math.abs(numAnswer - currentProblem.answer) < 0.01;

    const result = { ...currentProblem, userAnswer: numAnswer, correct, time: elapsed, index: problemIndex };
    const newResults = [...sessionResults, result];
    setSessionResults(newResults);
    resultsRef.current = newResults;

    setFeedbackAnswer(currentProblem.answer);
    setShowFeedback(correct ? "correct" : "wrong");

    // Update all-time stats
    setAllTimeStats(prev => {
      const next = { ...prev, totalProblems: prev.totalProblems + 1, totalCorrect: prev.totalCorrect + (correct ? 1 : 0) };
      const typeKey = currentProblem.type;
      if (next.byType[typeKey]) {
        next.byType[typeKey] = {
          ...next.byType[typeKey],
          attempts: next.byType[typeKey].attempts + 1,
          correct: next.byType[typeKey].correct + (correct ? 1 : 0),
          totalTime: next.byType[typeKey].totalTime + elapsed,
          times: [...next.byType[typeKey].times.slice(-49), elapsed],
        };
      }
      return next;
    });

    setTimeout(() => {
      setShowFeedback(null);
      setFeedbackAnswer(null);
      setUserAnswer("");
      const nextIdx = problemIndex + 1;
      if (nextIdx >= MODES[mode].problems) {
        endSession(newResults);
      } else {
        setProblemIndex(nextIdx);
        setCurrentProblem(generateProblem(problemType, difficulty));
        setProblemStartTime(Date.now());
      }
    }, correct ? 350 : 1100);
  }

  function endSession(results) {
    const r = results || sessionResults;
    setSessionActive(false);
    clearTimeout(timerRef.current);
    setAllTimeStats(prev => ({ ...prev, sessions: prev.sessions + 1 }));
    detectAndShowTips(r);
    setScreen("results");
  }

  function detectAndShowTips(results) {
    const byType = {};
    results.forEach(r => {
      if (!byType[r.type]) byType[r.type] = { correct: 0, total: 0, times: [] };
      byType[r.type].total++;
      if (r.correct) byType[r.type].correct++;
      byType[r.type].times.push(r.time);
    });

    const tips = [];
    const overallAvgTime = results.length > 0 ? results.reduce((a, r) => a + r.time, 0) / results.length : 0;

    Object.entries(byType).forEach(([type, data]) => {
      const accuracy = data.total > 0 ? data.correct / data.total : 1;
      const avgTime = data.times.length > 0 ? data.times.reduce((a, b) => a + b, 0) / data.times.length : 0;

      let reason = null;
      if (accuracy < 0.6 && data.total >= 2)
        reason = `Your accuracy for ${TYPE_LABELS[type]} was only ${Math.round(accuracy * 100)}% this session.`;
      else if (avgTime > overallAvgTime * 1.4 && data.total >= 2)
        reason = `You were ${Math.round((avgTime / overallAvgTime - 1) * 100)}% slower on ${TYPE_LABELS[type]} problems than your session average.`;

      if (reason && TIPS[type]) {
        const tip = TIPS[type][Math.floor(Math.random() * TIPS[type].length)];
        tips.push({ type, reason, ...tip });
      }
    });

    // Also check all-time persistent weaknesses
    const ats = allTimeStats.byType;
    Object.entries(ats).forEach(([type, data]) => {
      if (data.attempts < 10 || tips.find(t => t.type === type)) return;
      const accuracy = data.correct / data.attempts;
      if (accuracy < 0.65 && TIPS[type]) {
        const tip = TIPS[type][Math.floor(Math.random() * TIPS[type].length)];
        tips.push({ type, reason: `Your all-time ${TYPE_LABELS[type]} accuracy is ${Math.round(accuracy * 100)}%. Here's a technique that can help.`, ...tip });
      }
    });

    setShownTips(tips);
  }

  function handleKeyDown(e) { if (e.key === "Enter") submitAnswer(); }

  function resetAllStats() {
    setAllTimeStats({ sessions: 0, totalProblems: 0, totalCorrect: 0, byType: emptyTypeStats() });
  }

  // ── Computed ──
  const sessionAccuracy = sessionResults.length > 0 ? sessionResults.filter(r => r.correct).length / sessionResults.length : 0;
  const sessionAvgTime = sessionResults.length > 0 ? sessionResults.reduce((a, r) => a + r.time, 0) / sessionResults.length : 0;

  const staminaAnalysis = useMemo(() => {
    if (sessionResults.length < 8) return null;
    const q = Math.floor(sessionResults.length / 4);
    return [
      sessionResults.slice(0, q),
      sessionResults.slice(q, q * 2),
      sessionResults.slice(q * 2, q * 3),
      sessionResults.slice(q * 3),
    ].map((chunk, i) => ({
      label: `Q${i + 1}`,
      accuracy: chunk.filter(r => r.correct).length / chunk.length,
      avgTime: chunk.reduce((a, r) => a + r.time, 0) / chunk.length,
      count: chunk.length,
    }));
  }, [sessionResults]);

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */

  return (
    <div className="app">

      {/* ── HEADER ── */}
      <header className="header">
        <div className="header-inner">
          <div className="logo" onClick={() => { setSessionActive(false); setScreen("home"); }}>
            <span className="logo-icon">◆</span>
            <span className="logo-text">MATHLETE</span>
          </div>
          <nav className="nav">
            {screen !== "home" && (
              <button className="nav-btn" onClick={() => { setSessionActive(false); setScreen("home"); }}>Train</button>
            )}
            <button className="nav-btn" onClick={() => setScreen("analytics")}>Stats</button>
          </nav>
        </div>
      </header>

      <main className="main-content">

        {/* ══════════ HOME ══════════ */}
        {screen === "home" && (
          <div className="fade-in">
            <div className="hero">
              <h1 className="hero-title">Train Your<br/><span className="accent">Mental Math</span></h1>
              <p className="hero-sub">Build speed, precision, and endurance through deliberate practice</p>
            </div>

            <div className="mode-grid">
              {Object.entries(MODES).map(([key, m]) => (
                <button key={key} className="mode-card" onClick={() => startSetup(key)}>
                  <span className="mode-icon">{m.icon}</span>
                  <span className="mode-label">{m.label}</span>
                  <span className="mode-desc">{m.desc}</span>
                </button>
              ))}
            </div>

            {allTimeStats.sessions > 0 && (
              <div className="quick-stats">
                <div className="quick-stat">
                  <span className="quick-num">{allTimeStats.sessions}</span>
                  <span className="quick-label">sessions</span>
                </div>
                <div className="quick-stat">
                  <span className="quick-num">{allTimeStats.totalProblems}</span>
                  <span className="quick-label">problems</span>
                </div>
                <div className="quick-stat">
                  <span className="quick-num">
                    {allTimeStats.totalProblems > 0 ? Math.round(allTimeStats.totalCorrect / allTimeStats.totalProblems * 100) : 0}%
                  </span>
                  <span className="quick-label">accuracy</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════ SETUP ══════════ */}
        {screen === "setup" && mode && (
          <div className="setup fade-in">
            <h2 className="setup-title">{MODES[mode].icon} {MODES[mode].label}</h2>
            <p className="setup-desc">{MODES[mode].desc}</p>

            <div className="setup-section">
              <label className="setup-label">Problem Type</label>
              <div className="type-grid">
                {ALL_TYPES.map(t => (
                  <button key={t} onClick={() => setProblemType(t)}
                    className={`type-btn ${problemType === t ? "active" : ""}`}>
                    <span className="type-icon">{TYPE_ICONS[t]}</span>
                    <span className="type-name">{TYPE_LABELS[t]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="setup-section">
              <label className="setup-label">Difficulty</label>
              <div className="diff-row">
                {[1, 2, 3].map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`diff-btn ${difficulty === d ? "active" : ""}`}>
                    {d === 1 ? "Easy" : d === 2 ? "Medium" : "Hard"}
                  </button>
                ))}
              </div>
            </div>

            <button className="primary-btn" onClick={startCountdown}>Begin Training →</button>
          </div>
        )}

        {/* ══════════ TRAINING ══════════ */}
        {screen === "training" && (
          <div className="training fade-in">
            {countdown !== null ? (
              <div className="countdown-wrap">
                <div className="countdown-num" key={countdown}>{countdown || "GO!"}</div>
              </div>
            ) : currentProblem && (
              <>
                <div className="training-top">
                  <div className="top-left">
                    <span className="problem-num">#{problemIndex + 1}</span>
                    <span className="problem-tag">{TYPE_LABELS[currentProblem.type]}</span>
                  </div>
                  <div className="top-right">
                    {mode === "speed" ? (
                      <span className={`timer ${timeLeft <= 10 ? "timer-danger" : ""}`}>{timeLeft}s</span>
                    ) : (
                      <span className="progress-text">{problemIndex + 1} / {MODES[mode].problems}</span>
                    )}
                  </div>
                </div>

                <div className="progress-bar">
                  <div className={`progress-fill ${mode === "speed" && timeLeft <= 10 ? "danger" : ""}`}
                    style={{ width: mode === "speed"
                      ? `${(timeLeft / MODES[mode].time) * 100}%`
                      : `${(problemIndex / MODES[mode].problems) * 100}%`
                    }} />
                </div>

                <div className="problem-area">
                  <div className="problem-text">{currentProblem.question}</div>
                  <div className="equals">=</div>
                  <div className="input-wrap">
                    <input ref={inputRef} type="number" inputMode="decimal" value={userAnswer}
                      onChange={e => setUserAnswer(e.target.value)} onKeyDown={handleKeyDown}
                      className={`answer-input ${showFeedback === "correct" ? "input-correct" : ""} ${showFeedback === "wrong" ? "input-wrong" : ""}`}
                      placeholder="?" disabled={!!showFeedback} autoFocus />
                    {showFeedback === "wrong" && (
                      <div className="correct-answer">Answer: {feedbackAnswer}</div>
                    )}
                  </div>
                  <button className="submit-btn" onClick={submitAnswer} disabled={!!showFeedback}>↵</button>
                </div>

                <div className="live-stats">
                  <span className="live-correct">✓ {sessionResults.filter(r => r.correct).length}</span>
                  <span className="live-wrong">✗ {sessionResults.filter(r => !r.correct).length}</span>
                  {sessionResults.length > 0 && <span className="live-avg">⌀ {sessionAvgTime.toFixed(1)}s</span>}
                </div>

                <button className="end-early" onClick={() => endSession(sessionResults)}>End Session Early</button>
              </>
            )}
          </div>
        )}

        {/* ══════════ RESULTS ══════════ */}
        {screen === "results" && (
          <div className="results fade-in">
            <h2 className="results-title">Session Complete</h2>

            <div className="big-stats">
              <div className="big-stat">
                <span className="big-num">{sessionResults.length}</span>
                <span className="big-label">Problems</span>
              </div>
              <div className="big-stat">
                <span className={`big-num ${sessionAccuracy >= 0.8 ? "clr-good" : sessionAccuracy >= 0.5 ? "clr-warn" : "clr-bad"}`}>
                  {Math.round(sessionAccuracy * 100)}%
                </span>
                <span className="big-label">Accuracy</span>
              </div>
              <div className="big-stat">
                <span className="big-num">{sessionAvgTime.toFixed(1)}s</span>
                <span className="big-label">Avg Time</span>
              </div>
            </div>

            {/* Stamina chart */}
            {staminaAnalysis && mode === "stamina" && (
              <div className="card stamina-section">
                <h3 className="section-title">Stamina Breakdown</h3>
                <div className="stamina-grid">
                  {staminaAnalysis.map((q, i) => (
                    <div key={i} className="stamina-q">
                      <div className="sq-label">{q.label}</div>
                      <div className="sq-bar-wrap">
                        <div className={`sq-bar ${q.accuracy >= 0.8 ? "bg-good" : q.accuracy >= 0.5 ? "bg-warn" : "bg-bad"}`}
                          style={{ height: `${q.accuracy * 100}%` }} />
                      </div>
                      <div className="sq-acc">{Math.round(q.accuracy * 100)}%</div>
                      <div className="sq-time">{q.avgTime.toFixed(1)}s</div>
                    </div>
                  ))}
                </div>
                {staminaAnalysis[3].accuracy < staminaAnalysis[0].accuracy - 0.1 && (
                  <p className="stamina-warn">⚠ Your accuracy dropped {Math.round((staminaAnalysis[0].accuracy - staminaAnalysis[3].accuracy) * 100)}% from start to finish. Try shorter sessions and build up gradually!</p>
                )}
                {staminaAnalysis[3].avgTime > staminaAnalysis[0].avgTime * 1.3 && (
                  <p className="stamina-warn">⚠ You slowed down by {Math.round((staminaAnalysis[3].avgTime / staminaAnalysis[0].avgTime - 1) * 100)}% toward the end. Mental fatigue is real — try pausing to breathe between problems.</p>
                )}
              </div>
            )}

            {/* Tips */}
            {shownTips.length > 0 && (
              <div className="tips-section">
                <h3 className="section-title">💡 Tips for You</h3>
                {shownTips.map((tip, i) => (
                  <div key={i} className="tip-card">
                    <div className="tip-reason">{tip.reason}</div>
                    <div className="tip-title">{tip.title}</div>
                    <div className="tip-body">{tip.tip}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Per-type breakdown */}
            <div className="breakdown-section">
              <h3 className="section-title">By Problem Type</h3>
              {Object.entries(
                sessionResults.reduce((acc, r) => {
                  if (!acc[r.type]) acc[r.type] = { correct: 0, total: 0, time: 0 };
                  acc[r.type].total++;
                  if (r.correct) acc[r.type].correct++;
                  acc[r.type].time += r.time;
                  return acc;
                }, {})
              ).map(([type, data]) => (
                <div key={type} className="breakdown-row">
                  <span className="bd-type">{TYPE_ICONS[type]} {TYPE_LABELS[type]}</span>
                  <span className="bd-bar"><span className="bd-fill" style={{ width: `${(data.correct / data.total) * 100}%` }} /></span>
                  <span className="bd-acc">{Math.round(data.correct / data.total * 100)}%</span>
                  <span className="bd-time">{(data.time / data.total).toFixed(1)}s</span>
                </div>
              ))}
            </div>

            <div className="results-actions">
              <button className="primary-btn" onClick={startCountdown}>Train Again →</button>
              <button className="secondary-btn" onClick={() => setScreen("home")}>Change Mode</button>
            </div>
          </div>
        )}

        {/* ══════════ ANALYTICS ══════════ */}
        {screen === "analytics" && (
          <div className="analytics fade-in">
            <h2 className="results-title">All-Time Statistics</h2>

            {allTimeStats.totalProblems === 0 ? (
              <div className="empty-state">
                <p>No data yet. Complete a training session to see your analytics!</p>
                <button className="primary-btn" onClick={() => setScreen("home")}>Start Training →</button>
              </div>
            ) : (
              <>
                <div className="big-stats">
                  <div className="big-stat">
                    <span className="big-num">{allTimeStats.sessions}</span>
                    <span className="big-label">Sessions</span>
                  </div>
                  <div className="big-stat">
                    <span className="big-num">{allTimeStats.totalProblems}</span>
                    <span className="big-label">Total Solved</span>
                  </div>
                  <div className="big-stat">
                    <span className={`big-num ${(allTimeStats.totalCorrect / allTimeStats.totalProblems) >= 0.8 ? "clr-good" : "clr-warn"}`}>
                      {Math.round(allTimeStats.totalCorrect / allTimeStats.totalProblems * 100)}%
                    </span>
                    <span className="big-label">Overall Accuracy</span>
                  </div>
                </div>

                <div className="analytics-grid">
                  {Object.entries(allTimeStats.byType).filter(([_, d]) => d.attempts > 0).map(([type, data]) => {
                    const acc = data.correct / data.attempts;
                    const avgT = data.totalTime / data.attempts;
                    return (
                      <div key={type} className="analytics-card">
                        <div className="ac-header">
                          <span className="ac-icon">{TYPE_ICONS[type]}</span>
                          <span className="ac-type">{TYPE_LABELS[type]}</span>
                        </div>
                        <div className="ac-row"><span>Attempted</span><span className="ac-val">{data.attempts}</span></div>
                        <div className="ac-row">
                          <span>Accuracy</span>
                          <span className={`ac-val ${acc >= 0.8 ? "clr-good" : acc >= 0.5 ? "clr-warn" : "clr-bad"}`}>{Math.round(acc * 100)}%</span>
                        </div>
                        <div className="ac-row"><span>Avg Time</span><span className="ac-val">{avgT.toFixed(1)}s</span></div>
                        {acc < 0.7 && TIPS[type] && (
                          <button className="tip-link" onClick={() => setShowTipModal(type)}>View Tips →</button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button className="reset-btn" onClick={() => { if (confirm("Reset all stats? This cannot be undone.")) resetAllStats(); }}>
                  Reset All Data
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {/* ── Tip Modal ── */}
      {showTipModal && TIPS[showTipModal] && (
        <div className="modal-overlay" onClick={() => setShowTipModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{TYPE_ICONS[showTipModal]} {TYPE_LABELS[showTipModal]} Tips</h3>
            {TIPS[showTipModal].map((tip, i) => (
              <div key={i} className="modal-tip">
                <div className="tip-title">{tip.title}</div>
                <div className="tip-body">{tip.tip}</div>
              </div>
            ))}
            <button className="secondary-btn" onClick={() => setShowTipModal(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
