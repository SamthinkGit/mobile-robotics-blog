import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

const mdContainer = document.getElementById("md-container");

function loadMarkdown(path) {
    var markdown;
    fetch(path)
    .then(r=>r.text())
    .then(
         md => {
            const html = marked.parse(md)
            mdContainer.innerHTML = html;
            hljs.highlightAll();
        }
    );
}
loadMarkdown("pages/landing-page.md")