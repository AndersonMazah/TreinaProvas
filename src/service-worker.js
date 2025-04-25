const cacheName = "provas-cache-v1";
const filesToCache = [
    "css/componentes.css",
    "css/main.css",
    "css/menu.css",
    "css/modal.css",
    "css/prova.css",
    "css/table.css",
    "css/tela.css",
    "icons/favicon.ico",
    "icons/icon-192.png",
    "icons/icon-512.png",
    "js/backup_restore.js",
    "js/cad_aula.js",
    "js/cad_materia.js",
    "js/cad_opcao.js",
    "js/cad_questao.js",
    "js/main.js",
    "js/prova.js",
    "index.html",
    "manifest.json"
];

self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open(cacheName).then((cache) => cache.addAll(filesToCache))
    );
});

self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches.match(e.request).then((res) => res || fetch(e.request))
    );
});
