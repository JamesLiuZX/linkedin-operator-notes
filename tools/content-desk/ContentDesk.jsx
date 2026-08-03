import React, { useState, useEffect, useMemo, useRef } from "react";
import { analyze as analyzeContent } from "@lib/analyze.mjs";

/* ============================================================================
   CONTENT DESK
   A pipeline ledger + evidence gate + live anti-slop scorer.
   The scorer mirrors scripts/content-check.mjs so the browser and CI agree.
   ========================================================================== */

const KEY = "contentdesk:v1";

const STAGES = [
  { id: "idea",      label: "Idea",      hint: "A claim you suspect is true." },
  { id: "evidence",  label: "Evidence",  hint: "Fill the block. No drafting before this." },
  { id: "draft",     label: "Draft",     hint: "Pass 1 generation, then adversarial pass 2." },
  { id: "gated",     label: "Gated",     hint: "Cleared the quality gate. Ready to schedule." },
  { id: "scheduled", label: "Scheduled", hint: "publishAt is set. Cron will take it." },
  { id: "published", label: "Published", hint: "Live with a canonical URL." },
];

// Labels only. Thresholds live in scripts/lib/analyze.mjs so CI is the source
// of truth for what "passing" means.
const KINDS = {
  article: { label: "Essay" },
  post:    { label: "Atom" },
  demo:    { label: "Demo" },
};

const SECTIONS = {
  markets:  "Market design",
  agents:   "Agents on rails",
  shipping: "Shipping",
  notes:    "Field notes",
};

/* ------------------------------------------------------------------ rules */

// The scorer is IMPORTED, not reimplemented. An earlier version of this file
// kept its own copy of the rule tables and they drifted from CI: the local
// LLM_TELLS list had lost "crucial" and "robust solution", and the takeaway
// check ran against the raw file instead of the body. Both meant the desk
// showed a green score for content the gate rejected. Do not inline it again.

/**
 * The desk supports a "demo" kind that the CLI does not, because a demo writeup
 * is shorter than an atom. Everything else defers to the shared spec.
 */
const DEMO_SPEC = { minWords: 80, maxWords: 300, minDensity: 4.0, maxHook: 12 };

function analyze(raw, kind) {
  const text = raw || "";
  // Empty is "not started", not "failing", so the ledger does not scream at a
  // card the moment it is created.
  if (!text.trim()) {
    return {
      checks: [{ id: "empty", label: "No draft yet", status: "warn", detail: "paste a draft to score it" }],
      score: 0, fails: 0, warns: 1,
      stats: { wc: 0, density: 0, sd: 0, specifics: 0 },
    };
  }
  // A demo writeup is scored against post rules, then its length and density
  // checks are relaxed to the demo spec.
  if (kind === "demo") {
    const r = analyzeContent(text, "post");
    const checks = r.checks.map((c) => {
      if (c.id === "density") {
        const pass = r.stats.density >= DEMO_SPEC.minDensity;
        return { ...c, status: pass ? "pass" : "fail",
          detail: `${r.stats.density.toFixed(1)} / 100w (need ${DEMO_SPEC.minDensity})` };
      }
      if (c.id === "length") {
        const pass = r.stats.wc >= DEMO_SPEC.minWords && r.stats.wc <= DEMO_SPEC.maxWords;
        return { ...c, status: pass ? "pass" : "warn",
          detail: `${r.stats.wc} (${DEMO_SPEC.minWords}-${DEMO_SPEC.maxWords})` };
      }
      return c;
    });
    const fails = checks.filter((c) => c.status === "fail").length;
    const warns = checks.filter((c) => c.status === "warn").length;
    return { checks, fails, warns, score: Math.max(0, Math.round(100 - fails * 14 - warns * 5)), stats: r.stats };
  }
  return analyzeContent(text, kind === "article" ? "article" : "post");
}

/* ------------------------------------------------------------------- seed */

const uid = () => Math.random().toString(36).slice(2,9);

const EVIDENCE_FIELDS = [
  ["claim","Claim","One falsifiable sentence."],
  ["moment","Moment","The specific day or incident that made this obvious."],
  ["numbers","Numbers","Two or more, with units and time windows."],
  ["names","Names","Products, companies, tools, mechanisms."],
  ["cost","Cost","What went wrong. What this admission costs you."],
  ["counter","Counterexample","A case where your claim fails."],
  ["action","Reader action","What they do differently Monday."],
];

const blankEvidence = () => Object.fromEntries(EVIDENCE_FIELDS.map(([k])=>[k,""]));

const SEED = [
  { id:uid(), title:"The resolution criteria are the product", kind:"article", section:"markets", stage:"evidence",
    evidence:{...blankEvidence(), claim:"Most prediction market failures are writing failures, not oracle failures.",
      moment:"The match that got abandoned and my criteria said nothing about it."}, draft:"", shipAt:"" },
  { id:uid(), title:"I gave an LLM $100 and a prediction market", kind:"demo", section:"agents", stage:"idea",
    evidence:blankEvidence(), draft:"", shipAt:"" },
  { id:uid(), title:"Liquidity is a cold start problem, not a math problem", kind:"article", section:"markets", stage:"idea",
    evidence:blankEvidence(), draft:"", shipAt:"" },
  { id:uid(), title:"What the World Cup taught me about event-led retention", kind:"article", section:"shipping", stage:"idea",
    evidence:blankEvidence(), draft:"", shipAt:"" },
  { id:uid(), title:"Spec to PR: shipping product changes without waiting on eng", kind:"article", section:"agents", stage:"idea",
    evidence:blankEvidence(), draft:"", shipAt:"" },
  { id:uid(), title:"Your prediction market has adverse selection and you cannot see it", kind:"post", section:"markets", stage:"idea",
    evidence:blankEvidence(), draft:"", shipAt:"" },
];

/* -------------------------------------------------------------------- app */

export default function ContentDesk(){
  const [items,setItems]=useState(SEED);
  const [selId,setSelId]=useState(SEED[0].id);
  const [tab,setTab]=useState("evidence");
  const [loaded,setLoaded]=useState(false);
  const [err,setErr]=useState("");
  const saveTimer=useRef(null);

  useEffect(()=>{
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (Array.isArray(p.items) && p.items.length) {
          setItems(p.items);
          setSelId(p.items[0].id);
        }
      }
    } catch { /* first run */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify({ items }));
        setErr("");
      } catch {
        setErr("Not saved. Changes stay in this session only.");
      }
    }, 600);
    return () => clearTimeout(saveTimer.current);
  }, [items, loaded]);

  const sel=items.find(i=>i.id===selId)||items[0]||null;
  const report=useMemo(()=>sel?analyze(sel.draft,sel.kind):null,[sel?.draft,sel?.kind,sel?.id]);

  const patch=(id,fields)=>setItems(xs=>xs.map(x=>x.id===id?{...x,...fields}:x));
  const patchEv=(id,k,v)=>setItems(xs=>xs.map(x=>x.id===id?{...x,evidence:{...x.evidence,[k]:v}}:x));

  const addItem=()=>{ const it={id:uid(),title:"Untitled",kind:"post",section:"notes",stage:"idea",
    evidence:blankEvidence(),draft:"",shipAt:""};
    setItems(xs=>[it,...xs]); setSelId(it.id); setTab("evidence"); };

  const removeItem=(id)=>setItems(xs=>{ const n=xs.filter(x=>x.id!==id);
    if(id===selId) setSelId(n[0]?.id||null); return n; });

  const evidenceDone=(it)=>it?EVIDENCE_FIELDS.filter(([k])=>String(it.evidence?.[k]||"").trim().length>3).length:0;
  const counts=Object.fromEntries(STAGES.map(s=>[s.id,items.filter(i=>i.stage===s.id).length]));
  const shipped=counts.published||0;
  const inFlight=items.length-shipped-(counts.idea||0);
  const nextUp=items.filter(i=>i.shipAt).sort((a,b)=>a.shipAt.localeCompare(b.shipAt))[0];

  return (
    <div className="cd">
      <style>{CSS}</style>

      <header className="cd-top">
        <div className="cd-brand">
          <span className="cd-mark" aria-hidden="true" />
          <div>
            <h1>Content desk</h1>
            <p>Evidence before drafting. Gate before shipping.</p>
          </div>
        </div>
        <dl className="cd-readout">
          <div><dt>Published</dt><dd>{shipped}</dd></div>
          <div><dt>In flight</dt><dd>{inFlight}</dd></div>
          <div><dt>Ideas</dt><dd>{counts.idea||0}</dd></div>
          <div className="wide"><dt>Next out</dt>
            <dd className="sm">{nextUp?`${nextUp.shipAt} · ${nextUp.title.slice(0,26)}`:"nothing scheduled"}</dd></div>
        </dl>
      </header>

      {err && <p className="cd-err">{err}</p>}

      <div className="cd-body">
        <section className="cd-ledger" aria-label="Pipeline">
          <div className="cd-ledger-head">
            <h2>Pipeline</h2>
            <button className="cd-add" onClick={addItem}>Add piece</button>
          </div>
          <div className="cd-scroll">
            {STAGES.map(st=>{
              const rows=items.filter(i=>i.stage===st.id);
              if(!rows.length) return null;
              return (
                <div key={st.id} className="cd-group">
                  <div className="cd-group-head">
                    <span className="cd-stage">{st.label}</span>
                    <span className="cd-count">{rows.length}</span>
                    <span className="cd-hint">{st.hint}</span>
                  </div>
                  {rows.map(it=>{
                    const rep=analyze(it.draft,it.kind);
                    const ev=evidenceDone(it);
                    return (
                      <button key={it.id}
                        className={"cd-row"+(it.id===selId?" is-sel":"")}
                        onClick={()=>setSelId(it.id)}>
                        <span className="cd-kind">{KINDS[it.kind].label}</span>
                        <span className="cd-title">{it.title}</span>
                        <span className={"cd-ev ev-"+(ev===7?"full":ev>3?"part":"none")}>{ev}/7</span>
                        <span className={"cd-score "+(rep.stats.wc===0?"s-none":rep.fails?"s-bad":rep.warns?"s-mid":"s-good")}>
                          {rep.stats.wc===0?"--":rep.score}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>

        <section className="cd-detail" aria-label="Piece detail">
          {!sel ? (
            <div className="cd-empty">
              <p>Nothing selected.</p>
              <button className="cd-add" onClick={addItem}>Add your first piece</button>
            </div>
          ) : (
            <>
              <div className="cd-meta">
                <input className="cd-title-in" value={sel.title}
                  onChange={e=>patch(sel.id,{title:e.target.value})} aria-label="Title" />
                <div className="cd-selects">
                  <label>Format
                    <select value={sel.kind} onChange={e=>patch(sel.id,{kind:e.target.value})}>
                      {Object.entries(KINDS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </label>
                  <label>Section
                    <select value={sel.section} onChange={e=>patch(sel.id,{section:e.target.value})}>
                      {Object.entries(SECTIONS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  </label>
                  <label>Stage
                    <select value={sel.stage} onChange={e=>patch(sel.id,{stage:e.target.value})}>
                      {STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </label>
                  <label>Ship date
                    <input type="date" value={sel.shipAt}
                      onChange={e=>patch(sel.id,{shipAt:e.target.value})} />
                  </label>
                  <button className="cd-del" onClick={()=>removeItem(sel.id)}>Delete</button>
                </div>
              </div>

              <nav className="cd-tabs">
                <button className={tab==="evidence"?"on":""} onClick={()=>setTab("evidence")}>
                  Evidence <span className="pill">{evidenceDone(sel)}/7</span>
                </button>
                <button className={tab==="draft"?"on":""} onClick={()=>setTab("draft")}>
                  Draft <span className="pill">{report.stats.wc}w</span>
                </button>
                <button className={tab==="export"?"on":""} onClick={()=>setTab("export")}>Export</button>
              </nav>

              {tab==="evidence" && (
                <div className="cd-pane">
                  <p className="cd-note">
                    If Cost is empty the piece is not ready. That field is the difference
                    between a post and a press release.
                  </p>
                  {EVIDENCE_FIELDS.map(([k,label,hint])=>(
                    <div key={k} className="cd-field">
                      <label htmlFor={"ev-"+k}>{label}<em>{hint}</em></label>
                      <textarea id={"ev-"+k} rows={k==="claim"?2:2}
                        value={sel.evidence?.[k]||""}
                        onChange={e=>patchEv(sel.id,k,e.target.value)} />
                    </div>
                  ))}
                </div>
              )}

              {tab==="draft" && (
                <div className="cd-pane cd-draftpane">
                  <textarea className="cd-draft" placeholder="Paste the draft. The tape scores as you type."
                    value={sel.draft} onChange={e=>patch(sel.id,{draft:e.target.value})} />
                  <Tape report={report} />
                </div>
              )}

              {tab==="export" && <Export item={sel} report={report} />}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- the tape */

function Tape({report}){
  const {checks,score,stats}=report;
  const tone=stats.wc===0?"none":report.fails?"bad":report.warns?"mid":"good";
  return (
    <aside className={"cd-tape tone-"+tone}>
      <div className="cd-tape-head">
        <span className="cd-tape-score">{stats.wc===0?"--":score}</span>
        <div>
          <strong>Gate</strong>
          <span>{report.fails} blocking · {report.warns} soft</span>
        </div>
      </div>
      <div className="cd-bar" role="img" aria-label={`Score ${score} of 100`}>
        <i style={{width:`${stats.wc===0?0:score}%`}} />
      </div>
      <ul className="cd-checks">
        {checks.map(c=>(
          <li key={c.id} className={"chk-"+c.status}>
            <span className="chk-dot" aria-hidden="true" />
            <span className="chk-label">{c.label}</span>
            <span className="chk-detail">{c.detail}</span>
          </li>
        ))}
      </ul>
      <div className="cd-stats">
        <span>{stats.wc} words</span>
        <span>{stats.specifics} specifics</span>
        <span>{stats.density.toFixed(1)}/100w</span>
        <span>rhythm {stats.sd.toFixed(1)}</span>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------- export */

function Export({item,report}){
  const slug=item.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60);
  const status=report.fails===0&&report.stats.wc>0?"compliance-checked":"draft";
  const fm=[
    "---",
    `title: "${item.title}"`,
    `slug: ${slug}`,
    `status: ${status}`,
    item.shipAt?`publishAt: ${item.shipAt}T01:00:00Z`:"publishAt:",
    `section: ${item.section}`,
    "platforms: twitter, substack",
    "tags: ",
    "twitterExcerpt: \"\"",
    "---",
    "",
    "<!-- EVIDENCE",
    ...EVIDENCE_FIELDS.map(([k,label])=>`${label}: ${item.evidence?.[k]||""}`),
    "-->",
    "",
    item.draft||"",
  ].join("\n");
  const dir=item.kind==="article"?"articles":"posts";
  const copy=()=>{ navigator.clipboard?.writeText(fm); };
  return (
    <div className="cd-pane">
      <p className="cd-note">Save as <code>{dir}/{slug}.md</code>. Status is set from the gate, so a failing draft can never claim to be checked.</p>
      <button className="cd-add" onClick={copy}>Copy file contents</button>
      <pre className="cd-pre">{fm}</pre>
    </div>
  );
}

/* --------------------------------------------------------------- styles */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');

.cd{--ink:#0E1219;--panel:#161C26;--panel2:#1B222E;--rule:#28313F;--amber:#E8A33D;
  --teal:#4FB3A8;--rose:#D9695F;--bone:#E7E4DD;--dim:#7E8899;
  background:var(--ink);color:var(--bone);font-family:'IBM Plex Sans',system-ui,sans-serif;
  min-height:100vh;padding:20px;box-sizing:border-box;line-height:1.5;}
.cd *{box-sizing:border-box}
.cd h1,.cd h2{font-family:'Space Grotesk',sans-serif;margin:0}
.cd button,.cd input,.cd select,.cd textarea{font:inherit;color:inherit}
.cd :focus-visible{outline:2px solid var(--amber);outline-offset:2px}

.cd-top{display:flex;flex-wrap:wrap;gap:20px;align-items:center;justify-content:space-between;
  border-bottom:1px solid var(--rule);padding-bottom:16px;margin-bottom:16px}
.cd-brand{display:flex;gap:12px;align-items:center}
.cd-mark{width:10px;height:34px;background:linear-gradient(180deg,var(--amber),transparent);
  border-radius:1px;box-shadow:0 0 14px rgba(232,163,61,.45)}
.cd-brand h1{font-size:19px;letter-spacing:-.01em}
.cd-brand p{margin:2px 0 0;font-size:12.5px;color:var(--dim)}
.cd-readout{display:flex;gap:22px;margin:0;flex-wrap:wrap}
.cd-readout div{display:flex;flex-direction:column}
.cd-readout dt{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--dim)}
.cd-readout dd{margin:2px 0 0;font-family:'JetBrains Mono',monospace;font-size:22px;
  font-weight:700;color:var(--amber)}
.cd-readout dd.sm{font-size:12px;color:var(--bone);font-weight:400;max-width:230px}
.cd-err{background:rgba(217,105,95,.12);border:1px solid var(--rose);color:var(--rose);
  padding:8px 12px;font-size:13px;margin:0 0 12px}

.cd-body{display:grid;grid-template-columns:minmax(300px,380px) 1fr;gap:16px;align-items:start}
@media (max-width:900px){.cd-body{grid-template-columns:1fr}}

.cd-ledger{background:var(--panel);border:1px solid var(--rule);min-height:60vh}
.cd-ledger-head{display:flex;justify-content:space-between;align-items:center;
  padding:12px 14px;border-bottom:1px solid var(--rule)}
.cd-ledger-head h2{font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim)}
.cd-scroll{max-height:72vh;overflow:auto}
.cd-group-head{display:flex;align-items:baseline;gap:8px;padding:12px 14px 6px}
.cd-stage{font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--amber)}
.cd-count{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--dim)}
.cd-hint{font-size:11px;color:var(--dim);flex:1;text-align:right;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cd-row{display:grid;grid-template-columns:44px 1fr 34px 30px;gap:8px;align-items:center;
  width:100%;text-align:left;background:none;border:0;border-top:1px solid rgba(40,49,63,.6);
  padding:9px 14px;cursor:pointer}
.cd-row:hover{background:var(--panel2)}
.cd-row.is-sel{background:var(--panel2);box-shadow:inset 3px 0 0 var(--amber)}
.cd-kind{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.1em;
  text-transform:uppercase;color:var(--dim)}
.cd-title{font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cd-ev{font-family:'JetBrains Mono',monospace;font-size:10.5px;text-align:right}
.ev-none{color:#4C5766}.ev-part{color:var(--amber)}.ev-full{color:var(--teal)}
.cd-score{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;text-align:right}
.s-none{color:#4C5766}.s-bad{color:var(--rose)}.s-mid{color:var(--amber)}.s-good{color:var(--teal)}

.cd-detail{background:var(--panel);border:1px solid var(--rule);min-height:60vh}
.cd-empty{padding:60px 20px;text-align:center;color:var(--dim)}
.cd-meta{padding:14px;border-bottom:1px solid var(--rule)}
.cd-title-in{width:100%;background:none;border:0;border-bottom:1px solid transparent;
  font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;padding:2px 0}
.cd-title-in:hover,.cd-title-in:focus{border-bottom-color:var(--rule)}
.cd-selects{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;margin-top:12px}
.cd-selects label{display:flex;flex-direction:column;gap:4px;font-family:'JetBrains Mono',monospace;
  font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--dim)}
.cd-selects select,.cd-selects input{background:var(--ink);border:1px solid var(--rule);
  padding:6px 8px;font-family:'IBM Plex Sans',sans-serif;font-size:13px;letter-spacing:0;
  text-transform:none;color:var(--bone)}
.cd-add{background:var(--amber);color:#181206;border:0;padding:7px 13px;font-weight:600;
  font-size:12.5px;cursor:pointer}
.cd-add:hover{background:#F2B24E}
.cd-del{background:none;border:1px solid var(--rule);color:var(--dim);padding:6px 10px;
  font-size:12px;cursor:pointer}
.cd-del:hover{border-color:var(--rose);color:var(--rose)}

.cd-tabs{display:flex;gap:0;border-bottom:1px solid var(--rule)}
.cd-tabs button{background:none;border:0;border-bottom:2px solid transparent;padding:10px 16px;
  color:var(--dim);cursor:pointer;font-size:13px;display:flex;gap:7px;align-items:center}
.cd-tabs button.on{color:var(--bone);border-bottom-color:var(--amber)}
.pill{font-family:'JetBrains Mono',monospace;font-size:10px;background:var(--ink);
  border:1px solid var(--rule);padding:1px 5px;color:var(--dim)}

.cd-pane{padding:16px}
.cd-note{font-size:12.5px;color:var(--dim);border-left:2px solid var(--amber);
  padding-left:10px;margin:0 0 16px}
.cd-note code{font-family:'JetBrains Mono',monospace;color:var(--amber);font-size:12px}
.cd-field{margin-bottom:14px}
.cd-field label{display:block;font-family:'JetBrains Mono',monospace;font-size:10px;
  letter-spacing:.12em;text-transform:uppercase;color:var(--amber);margin-bottom:5px}
.cd-field label em{display:block;font-family:'IBM Plex Sans',sans-serif;font-style:normal;
  font-size:11.5px;letter-spacing:0;text-transform:none;color:var(--dim);margin-top:2px}
.cd-field textarea{width:100%;background:var(--ink);border:1px solid var(--rule);
  padding:8px 10px;font-size:13.5px;resize:vertical}
.cd-field textarea:focus{border-color:var(--amber)}

.cd-draftpane{display:grid;grid-template-columns:1fr 300px;gap:16px;align-items:start}
@media (max-width:1100px){.cd-draftpane{grid-template-columns:1fr}}
.cd-draft{width:100%;min-height:460px;background:var(--ink);border:1px solid var(--rule);
  padding:14px;font-family:'IBM Plex Sans',sans-serif;font-size:14.5px;line-height:1.7;resize:vertical}
.cd-draft:focus{border-color:var(--amber)}

.cd-tape{border:1px solid var(--rule);background:var(--ink);position:sticky;top:16px}
.cd-tape-head{display:flex;gap:12px;align-items:center;padding:13px 14px;border-bottom:1px solid var(--rule)}
.cd-tape-score{font-family:'JetBrains Mono',monospace;font-size:34px;font-weight:700;line-height:1}
.tone-good .cd-tape-score{color:var(--teal)}
.tone-mid .cd-tape-score{color:var(--amber)}
.tone-bad .cd-tape-score{color:var(--rose)}
.tone-none .cd-tape-score{color:#4C5766}
.cd-tape-head strong{display:block;font-family:'Space Grotesk',sans-serif;font-size:14px}
.cd-tape-head span{font-size:11.5px;color:var(--dim)}
.cd-bar{height:3px;background:var(--rule)}
.cd-bar i{display:block;height:100%;transition:width .35s ease}
.tone-good .cd-bar i{background:var(--teal)}
.tone-mid .cd-bar i{background:var(--amber)}
.tone-bad .cd-bar i{background:var(--rose)}
.cd-checks{list-style:none;margin:0;padding:6px 0}
.cd-checks li{display:grid;grid-template-columns:14px 1fr;gap:0 8px;padding:5px 14px;font-size:12.5px}
.chk-dot{width:6px;height:6px;border-radius:50%;margin-top:6px}
.chk-pass .chk-dot{background:var(--teal)}
.chk-warn .chk-dot{background:var(--amber)}
.chk-fail .chk-dot{background:var(--rose);box-shadow:0 0 8px rgba(217,105,95,.7)}
.chk-pass .chk-label{color:var(--dim)}
.chk-fail .chk-label{color:var(--bone);font-weight:600}
.chk-detail{grid-column:2;font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--dim)}
.chk-pass .chk-detail{display:none}
.cd-stats{display:flex;flex-wrap:wrap;gap:12px;padding:10px 14px;border-top:1px solid var(--rule);
  font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--dim)}
.cd-pre{background:var(--ink);border:1px solid var(--rule);padding:12px;overflow:auto;
  font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--dim);
  white-space:pre-wrap;margin-top:14px;max-height:420px}
@media (prefers-reduced-motion:reduce){.cd *{transition:none!important}}
`;
