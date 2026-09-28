import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { getBatches, updateBatch, updateCandidate } from "./api";
import "./styles.css";

const navigation = [
  { id: "overview", label: "Overview", icon: "◫" },
  { id: "batches", label: "Batch directory", icon: "▦" },
  { id: "insights", label: "YP insights", icon: "↗" },
];

const scoreBands = [
  { label: "0–39", min: 0, max: 40, color: "rose" },
  { label: "40–59", min: 40, max: 60, color: "amber" },
  { label: "60–79", min: 60, max: 80, color: "blue" },
  { label: "80–100", min: 80, max: 101, color: "green" },
];

const formatDate = (date) => (date ? date : "Not provided");
const scoreLabel = (score) =>
  score === null || score === undefined ? "—" : `${Number(score).toFixed(Number(score) % 1 ? 1 : 0)}%`;
const percent = (value) => `${Math.round(value)}%`;
const displayValue = (value) => value || "Not provided";
const normalizeBatch = (batch) => ({
  ...batch,
  candidates: (batch.candidates || []).map((candidate) => ({
    ...candidate,
    batch: { name: batch.name, mentor: batch.mentor },
  })),
});

function App() {
  const [batches, setBatches] = useState([]);
  const [activePage, setActivePage] = useState("overview");
  const [selectedBatchId, setSelectedBatchId] = useState("all");
  const [selectedMentor, setSelectedMentor] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadBatches = async () => {
    try {
      setError("");
      setBatches((await getBatches()).map(normalizeBatch));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const candidates = useMemo(
    () => batches.flatMap((batch) => batch.candidates || []),
    [batches],
  );
  const mentors = useMemo(
    () => [...new Set(batches.map((batch) => batch.mentor?.name).filter(Boolean))].sort(),
    [batches],
  );
  const filteredBatches = useMemo(() => {
    const query = search.trim().toLowerCase();
    return batches.filter((batch) => {
      const matchesMentor = selectedMentor === "all" || batch.mentor?.name === selectedMentor;
      const matchesBatch = selectedBatchId === "all" || String(batch.id) === selectedBatchId;
      const matchesSearch =
        !query ||
        batch.name.toLowerCase().includes(query) ||
        batch.candidates?.some((candidate) => candidate.name.toLowerCase().includes(query));
      return matchesMentor && matchesBatch && matchesSearch;
    });
  }, [batches, search, selectedBatchId, selectedMentor]);

  const allScores = candidates.map((candidate) => candidate.m11Score).filter(Number.isFinite);
  const averageM11 = allScores.length
    ? allScores.reduce((sum, value) => sum + value, 0) / allScores.length
    : null;
  const assessedCount = candidates.filter((candidate) => candidate.finalOutcome).length;
  const passingCount = candidates.filter((candidate) => candidate.finalOutcome === "Pass").length;
  const passRate = assessedCount ? (passingCount / assessedCount) * 100 : 0;
  const deployedCount = candidates.filter((candidate) => candidate.benchStatus === "Deployed").length;

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  };

  const handleCandidateSave = async (id, details) => {
    const updated = await updateCandidate(id, details);
    setBatches((current) =>
      current.map((batch) => ({
        ...batch,
        candidates: batch.candidates.map((candidate) =>
          candidate.id === id ? { ...candidate, ...updated } : candidate,
        ),
      })),
    );
    setSelectedCandidate(null);
    showNotice("Candidate details saved.");
  };

  const handleBatchSave = async (id, details) => {
    const updated = await updateBatch(id, details);
    setBatches((current) =>
      current.map((batch) => (batch.id === id ? normalizeBatch(updated) : batch)),
    );
    setEditingBatch(null);
    showNotice("Batch dates saved.");
  };

  const navigate = (page) => {
    setActivePage(page);
    setSearch("");
    if (page === "batches") setSelectedBatchId("all");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={() => navigate("overview")}>
          <span className="brand-mark">b.</span>
          <span className="brand-copy">
            <strong>Bucks2Bar</strong>
            <small>i-Transform · YP success</small>
          </span>
        </a>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              className={`nav-button ${activePage === item.id ? "active" : ""}`}
              key={item.id}
              onClick={() => navigate(item.id)}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
              {item.id === "batches" && <span className="nav-count">{batches.length}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="team-avatar">iT</span>
          <span>
            <strong>i-Transform team</strong>
            <small>Mentoring workspace</small>
          </span>
          <span className="online-dot" title="Workspace active" />
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>i-Transform</span><span className="crumb-divider">/</span>
            <strong>{navigation.find((item) => item.id === activePage)?.label}</strong>
          </div>
          <div className="topbar-right">
            <span className="reporting-pill"><span className="status-dot" /> Cohort report · Aug 2026</span>
            <div className="profile-avatar" aria-label="i-Transform team">IT</div>
          </div>
        </header>

        <div className="page-content">
          {error && (
            <div className="error-banner" role="alert">
              <strong>Could not load the cohort data.</strong> {error}
              <span>Start the Java API at <code>localhost:8080</code>, then refresh.</span>
              <button className="button button-small" onClick={loadBatches}>Retry</button>
            </div>
          )}
          {notice && <div className="notice-banner" role="status">{notice}</div>}
          {loading ? (
            <div className="loading-state"><span className="spinner" /> Loading cohorts…</div>
          ) : (
            <>
              {activePage === "overview" && (
                <OverviewPage
                  batches={batches}
                  candidates={candidates}
                  averageM11={averageM11}
                  passRate={passRate}
                  deployedCount={deployedCount}
                  onOpenBatch={(batchId) => {
                    setSelectedBatchId(String(batchId));
                    navigate("batches");
                    setSelectedBatchId(String(batchId));
                  }}
                  onOpenCandidate={setSelectedCandidate}
                  onOpenInsights={() => navigate("insights")}
                  onOpenBatches={() => navigate("batches")}
                />
              )}
              {activePage === "batches" && (
                <BatchesPage
                  batches={batches}
                  candidates={candidates}
                  filteredBatches={filteredBatches}
                  mentors={mentors}
                  search={search}
                  selectedBatchId={selectedBatchId}
                  selectedMentor={selectedMentor}
                  onSearch={setSearch}
                  onSelectBatch={setSelectedBatchId}
                  onSelectMentor={setSelectedMentor}
                  onOpenCandidate={setSelectedCandidate}
                  onEditBatch={setEditingBatch}
                />
              )}
              {activePage === "insights" && (
                <InsightsPage
                  batches={batches}
                  candidates={candidates}
                  averageM11={averageM11}
                  passRate={passRate}
                  scoreBands={scoreBands}
                />
              )}
            </>
          )}
        </div>
      </main>

      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onSave={handleCandidateSave}
        />
      )}
      {editingBatch && (
        <BatchModal
          batch={editingBatch}
          onClose={() => setEditingBatch(null)}
          onSave={handleBatchSave}
        />
      )}
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, detail, icon, accent }) {
  return (
    <article className={`stat-card ${accent || ""}`}>
      <div className="stat-top">
        <span>{label}</span>
        <span className={`stat-icon ${accent || ""}`} aria-hidden="true">{icon}</span>
      </div>
      <strong className="stat-value">{value}</strong>
      <span className="stat-detail">{detail}</span>
    </article>
  );
}

function OverviewPage({
  batches,
  candidates,
  averageM11,
  passRate,
  deployedCount,
  onOpenBatch,
  onOpenCandidate,
  onOpenInsights,
  onOpenBatches,
}) {
  const recentCandidates = [...candidates]
    .sort((a, b) => (b.m11Score ?? -1) - (a.m11Score ?? -1))
    .slice(0, 5);

  return (
    <>
      <PageHeading
        eyebrow="MENTORING SNAPSHOT"
        title="Your cohorts at a glance"
        description="A clear view of mentor-led cohorts, learner progress, and what's next."
        action={<button className="button" onClick={onOpenInsights}>View YP insights <span>↗</span></button>}
      />
      <div className="stat-grid">
        <StatCard label="Young professionals" value={candidates.length} detail={`Across ${batches.length} batches in the report`} icon="♙" accent="pink" />
        <StatCard label="Mentors" value={new Set(batches.map((batch) => batch.mentor?.id)).size} detail="i-Transform mentoring team" icon="◉" accent="blue" />
        <StatCard label="Average M11 score" value={averageM11 === null ? "—" : percent(averageM11)} detail="Session 1 · first attempt" icon="↗" accent="green" />
        <StatCard label="Assessment pass rate" value={percent(passRate)} detail={candidates.some((candidate) => candidate.benchStatus) ? `${deployedCount} deployed · placement records entered` : "Placement details not provided"} icon="✓" accent="amber" />
      </div>

      <section className="content-section">
        <div className="section-heading">
          <div><h2>Mentor cohorts</h2><p>Batch roster and learner progress from the latest report</p></div>
          <button className="text-button" onClick={onOpenBatches}>View all batches <span>→</span></button>
        </div>
        <BatchCardGrid batches={batches.slice(0, 6)} onOpenBatch={onOpenBatch} />
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div><h2>Standout learners</h2><p>Top M11 results from the reported first attempt</p></div>
        </div>
        <div className="table-card">
          <CandidateTable candidates={recentCandidates} compact onOpenCandidate={onOpenCandidate} />
        </div>
      </section>
    </>
  );
}

function BatchCardGrid({ batches, onOpenBatch }) {
  if (!batches.length) return <EmptyState title="No batches yet" detail="The imported report doesn't contain any batches." />;
  return (
    <div className="batch-grid">
      {batches.map((batch, index) => {
        const students = batch.candidates || [];
        const scores = students.map((candidate) => candidate.m11Score).filter(Number.isFinite);
        const average = scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null;
        return (
          <button className="batch-card" key={batch.id} onClick={() => onOpenBatch(batch.id)}>
            <div className="batch-card-top">
              <span className={`cohort-badge cohort-${index % 5}`}>{batch.cohort || "Cohort"}</span>
              <span className="card-arrow" aria-hidden="true">↗</span>
            </div>
            <h3>{batch.name}</h3>
            <div className="mentor-line"><span className={`mentor-avatar mentor-${index % 5}`}>{initials(batch.mentor?.name)}</span><span>{batch.mentor?.name || "Mentor not assigned"}</span></div>
            <div className="batch-card-bottom">
              <span><strong>{students.length}</strong> YPs</span>
              <span className="card-score">M11 <strong>{average === null ? "—" : percent(average)}</strong></span>
            </div>
            <div className="progress-track"><span style={{ width: `${average || 0}%` }} /></div>
          </button>
        );
      })}
    </div>
  );
}

function BatchesPage({
  batches,
  candidates,
  filteredBatches,
  mentors,
  search,
  selectedBatchId,
  selectedMentor,
  onSearch,
  onSelectBatch,
  onSelectMentor,
  onOpenCandidate,
  onEditBatch,
}) {
  const selectedBatch = batches.find((batch) => String(batch.id) === selectedBatchId);
  const batchCandidates = selectedBatch
    ? selectedBatch.candidates || []
    : filteredBatches.flatMap((batch) => batch.candidates || []);
  const query = search.trim().toLowerCase();
  const shownCandidates = batchCandidates.filter((candidate) =>
    !query ||
    candidate.name.toLowerCase().includes(query) ||
    candidate.id.toLowerCase().includes(query) ||
    candidate.batch?.name.toLowerCase().includes(query),
  );

  return (
    <>
      <PageHeading
        eyebrow="COHORT MANAGEMENT"
        title="Batch directory"
        description={`${candidates.length} young professionals across ${batches.length} mentor-led batches.`}
      />
      <div className="filter-bar">
        <label className="search-box"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search candidates or batches" aria-label="Search candidates or batches" /></label>
        <label className="filter-select"><span>Mentor</span><select value={selectedMentor} onChange={(event) => { onSelectMentor(event.target.value); onSelectBatch("all"); }}><option value="all">All mentors</option>{mentors.map((mentor) => <option key={mentor}>{mentor}</option>)}</select></label>
        <label className="filter-select"><span>Batch</span><select value={selectedBatchId} onChange={(event) => onSelectBatch(event.target.value)}><option value="all">All batches</option>{batches.map((batch) => <option value={batch.id} key={batch.id}>{batch.name}</option>)}</select></label>
      </div>

      {selectedBatch ? (
        <section className="batch-detail-panel">
          <div className="batch-detail-header">
            <div>
              <button className="back-link" onClick={() => onSelectBatch("all")}>← All batches</button>
              <h2>{selectedBatch.name}</h2>
              <div className="batch-meta">
                <span className="mentor-avatar">{initials(selectedBatch.mentor?.name)}</span>
                <span>{selectedBatch.mentor?.name || "Mentor not assigned"}</span>
                <span className="meta-divider">·</span>
                <span>{selectedBatch.candidates?.length || 0} young professionals</span>
              </div>
            </div>
            <button className="button button-outline" onClick={() => onEditBatch(selectedBatch)}>Edit batch dates</button>
          </div>
          <div className="date-strip">
            <div><span>BATCH START</span><strong>{formatDate(selectedBatch.startDate)}</strong></div>
            <div><span>BATCH END</span><strong>{formatDate(selectedBatch.endDate)}</strong></div>
            <div><span>COHORT</span><strong>{displayValue(selectedBatch.cohort)}</strong></div>
            <div><span>MENTOR</span><strong>{displayValue(selectedBatch.mentor?.name)}</strong></div>
          </div>
          <div className="section-heading table-heading">
            <div><h2>Candidate progress</h2><p>M11 = session 1 · L1 = session 2 · scores are percentages</p></div>
          </div>
          <div className="table-card"><CandidateTable candidates={selectedBatch.candidates || []} onOpenCandidate={onOpenCandidate} /></div>
        </section>
      ) : (
        <>
          <section className="content-section first-section">
            <div className="section-heading"><div><h2>Mentor batches</h2><p>Select a batch to see its candidates, scores, and outcome details.</p></div><span className="result-count">{filteredBatches.length} batches</span></div>
            <BatchCardGrid batches={filteredBatches} onOpenBatch={(id) => onSelectBatch(String(id))} />
          </section>
          {filteredBatches.length > 0 && (
            <section className="content-section">
              <div className="section-heading"><div><h2>All candidates</h2><p>Search, filter, and open a candidate to update their outcome details.</p></div></div>
              <div className="table-card"><CandidateTable candidates={shownCandidates} onOpenCandidate={onOpenCandidate} /></div>
            </section>
          )}
        </>
      )}
    </>
  );
}

function CandidateTable({ candidates, compact = false, onOpenCandidate }) {
  const sorted = [...candidates].sort((a, b) => a.name.localeCompare(b.name));
  if (!sorted.length) return <EmptyState title="No candidates match" detail="Try clearing the search or choosing another filter." />;
  return (
    <div className="table-scroll">
      <table className="candidate-table">
        <thead><tr><th>Candidate</th><th>Mentor / batch</th><th>M11</th><th>L1</th><th>Final score</th><th>Progress rating</th><th>Assessment</th><th>Placement status</th><th aria-label="Actions" /></tr></thead>
        <tbody>{sorted.map((candidate) => (
          <tr key={candidate.id}>
            <td><div className="candidate-name"><span className="candidate-avatar">{initials(candidate.name)}</span><span><strong>{candidate.name}</strong><small>{candidate.id}</small></span></div></td>
            <td><span className="table-mentor">{candidate.batch?.mentor?.name || "—"}</span><small className="table-subtext">{candidate.batch?.name || ""}</small></td>
            <td><Score value={candidate.m11Score} /></td><td><Score value={candidate.l1Score} /></td>
            <td><strong className="final-score">{scoreLabel(candidate.finalScore)}</strong></td>
            <td><span className={`rating rating-${(candidate.progressRating || "").toLowerCase().replace(/\s/g, "-")}`}>{candidate.progressRating || "Not provided"}</span></td>
            <td><OutcomeBadge value={candidate.finalOutcome} /></td>
            <td><PlacementBadge candidate={candidate} /></td>
            <td><button className="row-action" onClick={() => onOpenCandidate(candidate)} aria-label={`View ${candidate.name} details`}>↗</button></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function Score({ value }) {
  if (value === null || value === undefined) return <span className="score-missing">—</span>;
  const score = Number(value);
  return <span className={`score-pill ${score >= 80 ? "score-high" : score >= 60 ? "score-mid" : "score-low"}`}>{scoreLabel(score)}</span>;
}

function OutcomeBadge({ value }) {
  if (!value) return <span className="outcome-badge outcome-empty">Not provided</span>;
  const good = value.toLowerCase() === "pass";
  return <span className={`outcome-badge ${good ? "outcome-pass" : "outcome-review"}`}>{value}</span>;
}

function PlacementBadge({ candidate }) {
  if (!candidate.benchStatus) return <span className="outcome-badge outcome-empty">Not provided</span>;
  const deployed = candidate.benchStatus === "Deployed";
  const detail = deployed && candidate.deploymentDate
    ? `${candidate.benchStatus} · ${candidate.deploymentDate}`
    : candidate.benchStatus;
  return <span className={`outcome-badge ${deployed ? "outcome-pass" : "outcome-review"}`}>{detail}</span>;
}

function InsightsPage({ batches, candidates, averageM11, passRate, scoreBands }) {
  const batchStats = batches.map((batch) => ({
    name: batch.name.replace(/^2026_B\d+_/, "").replace(/_PT_.*/, ""),
    count: batch.candidates?.length || 0,
  }));
  const maxCount = Math.max(1, ...batchStats.map((item) => item.count));
  const scores = candidates.map((candidate) => candidate.m11Score).filter(Number.isFinite);
  const distributions = scoreBands.map((band) => ({
    ...band,
    count: scores.filter((score) => score >= band.min && score < band.max).length,
  }));
  const maxBand = Math.max(1, ...distributions.map((item) => item.count));
  const universities = candidates.reduce((counts, candidate) => {
    if (candidate.university) counts[candidate.university] = (counts[candidate.university] || 0) + 1;
    return counts;
  }, {});
  const universityEntries = Object.entries(universities).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <PageHeading
        eyebrow="PROGRAM INSIGHTS"
        title="YP outcomes & insights"
        description="A snapshot of the August 2026 i-Transform report, based on M11 first-attempt scores."
      />
      <div className="stat-grid insights-stats">
        <StatCard label="YPs reported" value={candidates.length} detail="Across the imported batches" icon="♙" accent="pink" />
        <StatCard label="Average M11" value={averageM11 === null ? "—" : percent(averageM11)} detail="First-attempt assessment score" icon="↗" accent="blue" />
        <StatCard label="Assessment pass rate" value={percent(passRate)} detail="Based on the report's final assessment outcome" icon="✓" accent="green" />
        <StatCard label="Score coverage" value={scores.length} detail={`of ${candidates.length} candidates have an M11 score`} icon="◉" accent="amber" />
      </div>

      <div className="insights-grid">
        <section className="chart-card">
          <div className="chart-heading"><div><h2>YPs by batch</h2><p>Candidate count in the current report</p></div><span className="chart-icon">▥</span></div>
          {batchStats.length ? (
            <div className="bar-chart" aria-label="YP count per batch">
              {batchStats.map((item, index) => (
                <div className="bar-column" key={batches[index].id}>
                  <strong>{item.count}</strong>
                  <div className={`bar-track bar-${index % 5}`}><span style={{ height: `${Math.max(8, (item.count / maxCount) * 100)}%` }} /></div>
                  <span className="bar-label" title={batches[index].name}>{item.name}</span>
                </div>
              ))}
            </div>
          ) : <EmptyState title="No batch data" detail="Batch counts will appear after importing a report." />}
          <p className="chart-footnote">One reporting snapshot only; this is not a historical month-by-month trend.</p>
        </section>

        <section className="chart-card">
          <div className="chart-heading"><div><h2>M11 score distribution</h2><p>First-attempt scores across the cohort</p></div><span className="chart-icon">⌁</span></div>
          <div className="distribution-list">{distributions.map((band) => (
            <div className="distribution-row" key={band.label}>
              <span>{band.label}</span><div className="distribution-track"><span className={`distribution-fill ${band.color}`} style={{ width: `${(band.count / maxBand) * 100}%` }} /></div><strong>{band.count}</strong>
            </div>
          ))}</div>
          <div className="chart-legend"><span><i className="legend-dot legend-pink" />Needs support</span><span><i className="legend-dot legend-green" />On track</span></div>
        </section>

        <section className="chart-card university-card">
          <div className="chart-heading"><div><h2>University breakdown</h2><p>Candidate split by university</p></div><span className="chart-icon">⌖</span></div>
          {universityEntries.length ? (
            <div className="university-list">{universityEntries.map(([university, count]) => (
              <div className="university-row" key={university}><span>{university}</span><strong>{count}</strong><span className="university-share">{percent((count / candidates.length) * 100)}</span></div>
            ))}</div>
          ) : (
            <div className="data-pending"><span className="pending-icon">i</span><div><strong>University details aren't in the report</strong><p>University split will appear as this information is added to candidate profiles.</p></div></div>
          )}
        </section>

        <section className="chart-card program-card">
          <div className="chart-heading"><div><h2>About this snapshot</h2><p>Read the scores in context</p></div><span className="chart-icon">✳</span></div>
          <div className="program-facts">
            <div><span className="fact-number">{candidates.length}</span><span>YPs in the report</span></div>
            <div><span className="fact-number">{batches.length}</span><span>mentor-led batches</span></div>
            <div><span className="fact-number">{scores.length ? percent((scores.filter((score) => score >= 60).length / scores.length) * 100) : "—"}</span><span>M11 scores at 60% or higher</span></div>
          </div>
          <p className="chart-footnote">M11 represents session 1; L1 represents session 2 as mapped from the source workbook. University and placement fields remain blank where the source has no data.</p>
        </section>
      </div>
    </>
  );
}

function CandidateModal({ candidate, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    university: candidate.university || "",
    comment: candidate.comment || "",
    benchStatus: candidate.benchStatus || "",
    benchStartDate: candidate.benchStartDate || "",
    benchEndDate: candidate.benchEndDate || "",
    deploymentDate: candidate.deploymentDate || "",
    projectStartDate: candidate.projectStartDate || "",
    projectCode: candidate.projectCode || "",
    projectName: candidate.projectName || "",
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const change = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(candidate.id, Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value || null])));
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="candidate-dialog-title">
        <div className="modal-header"><div><span className="eyebrow">CANDIDATE PROFILE</span><h2 id="candidate-dialog-title">{candidate.name}</h2><p>{candidate.id} · {candidate.batch?.name || "Batch not provided"}</p></div><button className="close-button" onClick={onClose} aria-label="Close candidate details">×</button></div>
        <div className="candidate-score-strip"><div><span>M11 · SESSION 1</span><strong>{scoreLabel(candidate.m11Score)}</strong></div><div><span>L1 · SESSION 2</span><strong>{scoreLabel(candidate.l1Score)}</strong></div><div><span>FINAL SCORE</span><strong>{scoreLabel(candidate.finalScore)}</strong></div><div><span>PROGRESS RATING</span><strong>{candidate.progressRating || "—"}</strong></div></div>
        <form onSubmit={submit}>
          <h3 className="form-section-title">Candidate & placement details</h3>
          <div className="form-grid">
            <Field label="University" value={form.university} onChange={change("university")} />
            <label className="form-field"><span>Current bench status</span><select value={form.benchStatus} onChange={change("benchStatus")}><option value="">Not provided</option><option value="On bench">On bench</option><option value="Deployed">Deployed</option></select></label>
            <Field label="Bench start date" type="date" value={form.benchStartDate} onChange={change("benchStartDate")} />
            <Field label="Bench end date" type="date" value={form.benchEndDate} onChange={change("benchEndDate")} />
            <Field label="Deployment date" type="date" value={form.deploymentDate} onChange={change("deploymentDate")} />
            <Field label="Project start date" type="date" value={form.projectStartDate} onChange={change("projectStartDate")} />
            <Field label="Project code" value={form.projectCode} onChange={change("projectCode")} />
            <Field label="Project name" value={form.projectName} onChange={change("projectName")} />
            <label className="form-field form-field-wide"><span>Mentor comments</span><textarea rows="3" value={form.comment} onChange={change("comment")} placeholder="Add a progress or outcome note…" /></label>
          </div>
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="submit" className="button" disabled={saving}>{saving ? "Saving…" : "Save candidate"}</button></div>
        </form>
      </section>
    </div>
  );
}

function BatchModal({ batch, onClose, onSave }) {
  const [startDate, setStartDate] = useState(batch.startDate || "");
  const [endDate, setEndDate] = useState(batch.endDate || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(batch.id, { startDate: startDate || null, endDate: endDate || null });
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="detail-modal batch-modal" role="dialog" aria-modal="true" aria-labelledby="batch-dialog-title">
        <div className="modal-header"><div><span className="eyebrow">BATCH DETAILS</span><h2 id="batch-dialog-title">Batch dates</h2><p>{batch.name}</p></div><button className="close-button" onClick={onClose} aria-label="Close batch dates">×</button></div>
        <form onSubmit={submit}>
          <p className="modal-description">The source workbook doesn't include these dates. Add them when confirmed; empty values stay marked as not provided.</p>
          <div className="form-grid"><Field label="Batch start date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /><Field label="Batch end date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></div>
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="submit" className="button" disabled={saving}>{saving ? "Saving…" : "Save dates"}</button></div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return <label className="form-field"><span>{label}</span><input type={type} value={value} onChange={onChange} /></label>;
}

function EmptyState({ title, detail }) {
  return <div className="empty-state"><span>◌</span><strong>{title}</strong><p>{detail}</p></div>;
}

function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "YP";
}

createRoot(document.getElementById("root")).render(<App />);
