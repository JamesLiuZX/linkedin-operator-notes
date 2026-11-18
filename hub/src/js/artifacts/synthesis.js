// hub/src/js/artifacts/synthesis.js
//
// Draws an interview synthesis from synthesis.json (see skills/interview-synthesis/
// references/format.md). Every quote carries the transcript line it was found
// on and a few lines either side, so a reader can open any quote and see it in
// place. Quotes the script could not find are shown at the end, struck out.

const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const date = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : esc(iso || "");
};

const SHOWN = 2; // quotes visible per theme before "show all"

function context(q) {
  if (!q.ctx || !q.ctx.length) return "";
  return `<div class="sy-ctx" data-ctx-panel hidden>${q.ctx
    .map((l) => {
      const hit = l.n === q.line;
      let text = esc(l.text);
      if (hit) {
        const at = l.text.indexOf(q.text);
        text = at === -1 ? `<mark>${text}</mark>` : `${esc(l.text.slice(0, at))}<mark>${esc(q.text)}</mark>${esc(l.text.slice(at + q.text.length))}`;
      }
      return `<div class="sy-line${hit ? " hit" : ""}"><span class="sy-n">${l.n}</span><span class="sy-who">${esc(l.who || "")}</span><span class="sy-said">${text}</span></div>`;
    })
    .join("")}</div>`;
}

function quote(q, people, key, extra = "") {
  const person = people[q.p];
  const where = q.line ? `${esc(person?.file || q.p)}, line ${q.line}` : "not matched to a line";
  return `<figure class="sy-quote${extra}" data-quote="${esc(key)}">
    <blockquote>${esc(q.text)}</blockquote>
    <figcaption><b>${esc(q.p)}</b>${person?.name ? ` ${esc(person.name)}` : ""}${
      q.ctx && q.ctx.length ? `<button type="button" class="sy-where" data-ctx aria-expanded="false">${where}</button>` : `<span class="sy-where">${where}</span>`
    }</figcaption>
    ${context(q)}
  </figure>`;
}

function dots(support, order, people, counter) {
  return `<div class="sy-dots" aria-label="Supported by ${esc(support.join(", "))}">${order
    .map((id) => `<i class="${support.includes(id) ? "on" : ""}${counter === id ? " counter" : ""}" title="${esc(`${id}${people[id]?.name ? ` ${people[id].name}` : ""}`)}">${esc(id)}</i>`)
    .join("")}</div>`;
}

function theme(t, people, order) {
  const total = order.length;
  const more = t.quotes.length - SHOWN;
  return `<article class="sy-theme" data-theme="${esc(t.id)}" id="${esc(t.id)}">
    <div class="sy-theme-head">
      <span class="aid">${esc(t.id)}</span>
      <h2>${esc(t.name)}${t.led ? ` <span class="atag warn">Asked directly</span>` : ""}</h2>
      <div class="sy-count" data-count><b>${t.support.length}</b><span>of ${total}</span></div>
    </div>
    ${dots(t.support, order, people, t.counter?.p)}
    <p class="sy-sum">${esc(t.summary)}</p>
    <div class="sy-quotes">
      ${t.quotes.map((q, i) => quote(q, people, `${t.id}-${i}`, i >= SHOWN ? " extra" : "")).join("")}
      ${more > 0 ? `<button type="button" class="sy-more-btn" data-more>Show all ${t.quotes.length} quotes</button>` : ""}
    </div>
    ${
      t.counter
        ? `<div class="sy-counter"><span class="sy-label">The exception</span>${quote(t.counter, people, `${t.id}-c`)}${t.counterNote ? `<p class="sy-note">${esc(t.counterNote)}</p>` : ""}</div>`
        : t.counterNote
          ? `<div class="sy-counter"><span class="sy-label">The exception</span><p class="sy-note">${esc(t.counterNote)}</p></div>`
          : ""
    }
    ${t.so ? `<p class="sy-so"><b>So</b>${esc(t.so)}</p>` : ""}
  </article>`;
}

export function renderSynthesis(data) {
  const order = (data.participants || []).map((p) => p.id);
  const people = Object.fromEntries((data.participants || []).map((p) => [p.id, p]));
  const c = data.checked || {};
  const byHand = !!c.byHand;
  const rejected = data.rejected || [];
  const themes = data.themes || [];

  const proof = byHand
    ? `<div class="sy-proof warn" data-part="proof"><span><b>Not machine-checked.</b> The quotes on this page were not matched against the transcripts by the script.</span></div>`
    : `<div class="sy-proof" data-part="proof">
        <span class="sy-proof-ok"><b data-found>${c.found ?? "0"}</b> quotes, each found word for word in its transcript</span>
        ${c.rejected ? `<a class="sy-proof-x" href="#rejected"><b>${c.rejected}</b> not found, and removed</a>` : `<span class="sy-proof-none">None rejected</span>`}
      </div>`;

  return `
  <div class="sy-wrap">
    <header class="sy-head">
      <div class="sy-ey">Interview synthesis · ${order.length} participants${data.date ? ` · ${date(data.date)}` : ""}</div>
      <h1>${esc(data.title)}</h1>
      ${data.question ? `<p class="sy-q">${esc(data.question)}</p>` : ""}
      ${proof}
    </header>

    <section class="sy-people" data-part="people">
      <h3>Who we spoke to</h3>
      <div class="sy-people-grid">${(data.participants || []).map((p) => `<div class="sy-person"><span class="sy-pid">${esc(p.id)}</span><b>${esc(p.name || "")}</b><span>${esc(p.profile || "")}</span></div>`).join("")}</div>
    </section>

    <section class="sy-themes" data-part="themes">
      <h3>Themes, most supported first</h3>
      ${themes.map((t) => theme(t, people, order)).join("")}
    </section>

    <section class="sy-grid">
      ${
        (data.unprompted || []).length
          ? `<div class="sy-box"><h3>Raised without being asked</h3>${data.unprompted
              .map((u, i) => `<div class="sy-mini"><b>${esc(u.name)}</b><span class="sy-by">${esc((u.support || []).join(", "))}</span><p>${esc(u.summary)}</p>${(u.quotes || []).slice(0, 1).map((q) => quote(q, people, `U${i}-0`)).join("")}</div>`)
              .join("")}</div>`
          : ""
      }
      ${
        (data.requests || []).length
          ? `<div class="sy-box"><h3>What people asked for</h3><p class="sy-fine">Requests are recorded as said. They are not findings.</p><ul class="sy-list">${data.requests.map((r) => `<li><span>${esc(r.text)}</span><span class="sy-by">${esc((r.p || []).join(", "))}</span></li>`).join("")}</ul></div>`
          : ""
      }
      ${
        (data.quiet || []).length
          ? `<div class="sy-box"><h3>Who this page says least about</h3><ul class="sy-list">${data.quiet.map((q) => `<li><span><b>${esc(q.p)}${people[q.p]?.name ? ` ${esc(people[q.p].name)}` : ""}.</b> ${esc(q.note)}</span></li>`).join("")}</ul></div>`
          : ""
      }
      ${
        (data.unknowns || []).length
          ? `<div class="sy-box"><h3>What the interviews cannot answer</h3><ul class="sy-list">${data.unknowns.map((u) => `<li><span><b>${esc(u.q)}</b> ${esc(u.ask || "")}</span></li>`).join("")}</ul></div>`
          : ""
      }
    </section>

    ${
      rejected.length
        ? `<section class="sy-rejected" id="rejected" data-part="rejected">
        <h3>Removed by the check</h3>
        ${rejected
          .map(
            (r) => `<div class="sy-reject" data-reject>
          <blockquote>${esc(r.text)}</blockquote>
          <p><b>${esc(r.p)}${people[r.p]?.name ? ` ${esc(people[r.p].name)}` : ""}</b>${r.from ? `, offered for ${esc(r.from)}` : ""}. <span>${esc(r.reason || "not found in any transcript")}.</span></p>
        </div>`,
          )
          .join("")}
        <p class="sy-fine">A quote that is not in a transcript does not go on the page, however well it reads.</p>
      </section>`
        : ""
    }
  </div>`;
}

export function mountSynthesis(root, data) {
  root.classList.add("adoc", "synthesis");
  root.innerHTML = renderSynthesis(data);

  const setCtx = (fig, open) => {
    const panel = fig.querySelector("[data-ctx-panel]");
    const btn = fig.querySelector("[data-ctx]");
    if (!panel || !btn) return;
    panel.hidden = !open;
    fig.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
  };

  root.addEventListener("click", (ev) => {
    const ctx = ev.target.closest("[data-ctx]");
    if (ctx) {
      const fig = ctx.closest("[data-quote]");
      setCtx(fig, !fig.classList.contains("open"));
      return;
    }
    const more = ev.target.closest("[data-more]");
    if (more) {
      more.closest(".sy-quotes").classList.add("all");
      more.remove();
    }
  });

  return {
    root,
    /** Open or close the transcript context under one quote, by its key (for example "T1-0"). */
    context(key, open = true) {
      const fig = root.querySelector(`[data-quote="${key}"]`);
      if (fig) setCtx(fig, open);
    },
    closeAll() {
      root.querySelectorAll("[data-quote].open").forEach((f) => setCtx(f, false));
    },
  };
}
