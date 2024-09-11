import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

const mdContainer = document.getElementById("md-container");
const pages = document.querySelectorAll(".md-loader");

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

for (const page of pages) {
    page.addEventListener("click", () => loadMarkdown(`pages/${page.id.slice(3)}.md`))
}