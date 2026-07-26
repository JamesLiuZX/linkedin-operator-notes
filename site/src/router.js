const listeners = new Set();

export function currentPath() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const path = window.location.pathname.replace(base, "") || "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function navigate(to) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const target = to.startsWith("/") ? to : `/${to}`;
  window.history.pushState({}, "", `${base}${target}`);
  listeners.forEach((fn) => fn(currentPath()));
}

export function onRoute(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

window.addEventListener("popstate", () => {
  listeners.forEach((fn) => fn(currentPath()));
});

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href]");
  if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const href = a.getAttribute("href");
  if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) {
    return;
  }
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  if (base && href.startsWith(base)) {
    e.preventDefault();
    navigate(href.slice(base.length) || "/");
    return;
  }
  if (href.startsWith("/")) {
    e.preventDefault();
    navigate(href);
  }
});
