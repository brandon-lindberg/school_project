if(!self.define){let e,s={};const n=(n,a)=>(n=new URL(n+".js",a).href,s[n]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=s,document.head.appendChild(e)}else e=n,importScripts(n),s()})).then((()=>{let e=s[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(a,t)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(s[c])return;let i={};const r=e=>n(e,c),o={module:{uri:c},exports:i,require:r};s[c]=Promise.all(a.map((e=>o[e]||r(e)))).then((e=>(t(...e),i)))}}define(["./workbox-f1770938"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/41tARcLuEjXgnKts5kIsG/_buildManifest.js",revision:"b9b44a8437ca533878a61faead3c3832"},{url:"/_next/static/41tARcLuEjXgnKts5kIsG/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/0e762574-2f93538776a04368.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/173-ffc186be5e2fcf72.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/455-e20730cfa98e8031.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/4bd1b696-bb238a4dc104dfc8.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/565-4df3c36e28792362.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/615-38f3431f47ab0080.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/844-e5bfcd0505850d12.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/926.52e57a1e4dbf8170.js",revision:"52e57a1e4dbf8170"},{url:"/_next/static/chunks/app/_not-found/page-ba11ce49def74726.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/app/api/auth/%5B...nextauth%5D/route-6403c419818bf28f.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/app/api/auth/login/route-8a96c93d97a6229b.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/app/api/auth/logout/route-2632a2eac4739673.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/app/api/auth/register/route-556dc2ffa1c00cc2.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/app/api/browsing/route-a86d76d7d587b3be.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/app/api/schools/random/route-ef4089800f832092.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/app/api/schools/route-a37de29023218f74.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/app/api/user/preferences/route-06514c48552f3608.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/app/api/user/route-4651514b9c3fc1a4.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/app/api/userLists/check/route-fd3f9eadb5fafb6d.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/app/api/userLists/checkBulk/route-e1eee8f45194f427.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/app/api/userLists/route-fe3f52569aae5668.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/app/dashboard/page-31ee9457d5948ef7.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/app/layout-428624432b6208d3.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/app/list/page-23a9782153baaa4b.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/app/login/page-8c02b68fdda7d941.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/app/page-83bbedb93e39b4c9.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/app/register/page-ed7e097ebad197fd.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/app/schools/%5Bid%5D/page-4e29393b6509c69b.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/c16f53c3-06553c0ed0991f08.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/framework-6b27c2b7aa38af2d.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/main-85b8ee1018ba5536.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/main-app-d25afd2efc88f69c.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/pages/_app-d23763e3e6c904ff.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/pages/_error-9b7125ad1a1e68fa.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-b9558f2daf2e2d55.js",revision:"41tARcLuEjXgnKts5kIsG"},{url:"/_next/static/css/aa574f86ba370f68.css",revision:"aa574f86ba370f68"},{url:"/_next/static/css/d3af775329ad9daa.css",revision:"d3af775329ad9daa"},{url:"/_next/static/media/569ce4b8f30dc480-s.p.woff2",revision:"ef6cefb32024deac234e82f932a95cbd"},{url:"/_next/static/media/747892c23ea88013-s.woff2",revision:"a0761690ccf4441ace5cec893b82d4ab"},{url:"/_next/static/media/93f479601ee12b01-s.p.woff2",revision:"da83d5f06d825c5ae65b7cca706cb312"},{url:"/_next/static/media/ba015fad6dcf6784-s.woff2",revision:"8ea4f719af3312a055caf09f34c89a77"},{url:"/android-chrome-192x192.png",revision:"abdad2a5fdd9c7efad8124c531cd3203"},{url:"/android-chrome-512x512.png",revision:"83491ec85de46b291c27442c3a302196"},{url:"/apple-touch-icon.png",revision:"1ff629d9d9ea1517c86fc3feb8be3a2d"},{url:"/favicon-16x16.png",revision:"4e82b2d3b7b7329a99eaaf979ab2dec1"},{url:"/favicon-32x32.png",revision:"abba1e9c5444b6c0340ed1a03d6ceeea"},{url:"/favicon.ico",revision:"de106ee8b51c4eba349432735d60059d"},{url:"/file.svg",revision:"d09f95206c3fa0bb9bd9fefabfd0ea71"},{url:"/globe.svg",revision:"2aaafa6a49b6563925fe440891e32717"},{url:"/icons/icon-128x128.png",revision:"df4dab535c511664efc738be1703ae78"},{url:"/icons/icon-144x144.png",revision:"d96bff9728cc115cf20d673510a20455"},{url:"/icons/icon-152x152.png",revision:"380ea7b337d0c338bc83a2580cd09bc9"},{url:"/icons/icon-192x192.png",revision:"c1a6aa5920e743a34e268e8a53748bc2"},{url:"/icons/icon-256x256.png",revision:"9e42c57877c937c1f5fb229b8613152a"},{url:"/icons/icon-384x384.png",revision:"5b6215d2a6a3bb761559fd73de7967b3"},{url:"/icons/icon-48x48.png",revision:"aeae1e326f5c30c2a1c4b6e091e88580"},{url:"/icons/icon-512x512.png",revision:"cd206a52f9a28926e6fd238aa6b2d85e"},{url:"/icons/icon-72x72.png",revision:"805784bad1a6bf7685cc6b5043afa420"},{url:"/icons/icon-96x96.png",revision:"cf75020d1d35940479b35672f1994430"},{url:"/logo.png",revision:"458acf96922b64a26d246263989d564f"},{url:"/manifest.json",revision:"cad7f7f27556bce8f2d6017ae8242d1b"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/school_placeholder.jpg",revision:"2300847ac01814c8f7de4dadd31c25cc"},{url:"/site.webmanifest",revision:"053100cb84a50d2ae7f5492f7dd7f25e"},{url:"/vercel.svg",revision:"c0af2f507b369b085b35ef4bbe3bcf1e"},{url:"/window.svg",revision:"a2760511c65806022ad20adf74370ff3"}],{ignoreURLParametersMatching:[/^utm_/,/^fbclid$/]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({response:e})=>e&&"opaqueredirect"===e.type?new Response(e.body,{status:200,statusText:"OK",headers:e.headers}):e}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:2592e3})]}),"GET"),e.registerRoute(/\/_next\/static.+\.js$/i,new e.CacheFirst({cacheName:"next-static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4|webm)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:48,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({sameOrigin:e,url:{pathname:s}})=>!(!e||s.startsWith("/api/auth/callback")||!s.startsWith("/api/"))),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({request:e,url:{pathname:s},sameOrigin:n})=>"1"===e.headers.get("RSC")&&"1"===e.headers.get("Next-Router-Prefetch")&&n&&!s.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages-rsc-prefetch",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({request:e,url:{pathname:s},sameOrigin:n})=>"1"===e.headers.get("RSC")&&n&&!s.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages-rsc",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:{pathname:e},sameOrigin:s})=>s&&!e.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({sameOrigin:e})=>!e),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));