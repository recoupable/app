/* Synthetic hostile generated content. Every attempted destination is loopback. */
let score = 0;
const output = document.getElementById("probe-results");
const report = (name, result) => {
  output.textContent += name + ": " + result + "\n";
};
document.getElementById("advance").onclick = () => {
  document.getElementById("score").textContent = String(++score);
};
document.addEventListener("securitypolicyviolation", (event) => {
  report("CSP", event.effectiveDirective);
});
document.getElementById("run").onclick = async () => {
  output.textContent = "";
  for (const [name, probe] of [
    [
      "parent document / sentinel",
      () => parent.document.getElementById("credential-sentinel").textContent,
    ],
    [
      "parent storage",
      () => parent.sessionStorage.getItem("isolation-sentinel"),
    ],
    ["own opaque storage", () => sessionStorage.getItem("isolation-sentinel")],
    [
      "top navigation",
      () => {
        top.location.href = "http://127.0.0.1:8848/escape?kind=top";
      },
    ],
  ]) {
    try {
      probe();
      report(name, "UNEXPECTED ACCESS");
    } catch (error) {
      report(name, error.name);
    }
  }
  try {
    await fetch("http://127.0.0.1:8848/escape?kind=fetch");
    report("fetch", "UNEXPECTED ACCESS");
  } catch (error) {
    report("fetch", error.name);
  }
  const nested = document.createElement("iframe");
  nested.src = "http://127.0.0.1:8848/escape?kind=frame";
  document.body.append(nested);
  const form = document.createElement("form");
  form.action = "http://127.0.0.1:8848/escape?kind=form";
  form.target = "_top";
  document.body.append(form);
  form.submit();
  const base = document.createElement("base");
  base.href = "http://127.0.0.1:8848/escape/";
  document.head.append(base);
  report("base unchanged", String(document.baseURI !== base.href));
  for (const data of [
    null,
    "invalid",
    {},
    { type: "recoup:activity", event: "charge" },
    { type: "recoup:resize", height: "1000000" },
    { type: "recoup:resize", height: Infinity },
    { type: "recoup-music-continue" },
    { type: "recoup-music-resize", height: 99999 },
  ]) {
    parent.postMessage(data, "*");
  }
  for (let i = 0; i < 100; i++) {
    for (const event of ["visit", "start", "complete", "replay", "share"]) {
      parent.postMessage(
        { type: "recoup:activity", event, secret: "synthetic-extra-field" },
        "*",
      );
    }
  }
  report("flood", "500 messages sent; inspect trusted sink");
};
document.getElementById("resize-max").onclick = () =>
  parent.postMessage({ type: "recoup:resize", height: 1e9 }, "*");
document.getElementById("resize-min").onclick = () =>
  parent.postMessage({ type: "recoup:resize", height: -1 }, "*");
