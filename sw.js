// 配套 Service Worker：用于提升聊天模拟器的后台通知稳定性
// 使用方法：把这个文件和你的聊天模拟器 html 文件放在同一个目录下，
// 通过 https 网址（比如 GitHub Pages）打开页面即可自动生效。
// 注意：浏览器不允许在 file:// 本地直接打开的页面里注册 Service Worker，
// 这是浏览器的安全限制，不是这个文件的问题。

const CACHE_NAME = 'chat-app-shell-v1';

self.addEventListener('install', (event) => {
  // 立即激活，不用等旧版本关闭
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 简单直连转发：部分浏览器把"是否存在 fetch 监听"作为可安装 PWA 的判断依据之一，
// 这里不做离线缓存，只是原样放行请求。
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

// 点击系统通知时，尝试聚焦已打开的页面，如果没有打开的页面则新开一个
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('./');
      }
    })
  );
});

// 预留：如果以后接入了推送服务器，可以在这里处理 push 事件
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload = {};
  try { payload = event.data.json(); } catch (e) { payload = { title: '消息', body: event.data.text() }; }
  event.waitUntil(
    self.registration.showNotification(payload.title || '新消息', {
      body: payload.body || '',
      icon: payload.icon || ''
    })
  );
});
