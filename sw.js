self.addEventListener('install',e=>{
e.waitUntil(caches.open('trainer').then(c=>c.addAll(['./'])))
})