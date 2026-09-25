// Service worker mínimo: permite instalar MyVet como app en el celular.
// A propósito NO guarda copias de la página, así siempre se ve la versión más nueva.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
