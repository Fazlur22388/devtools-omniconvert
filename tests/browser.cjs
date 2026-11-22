const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn, execFileSync } = require('node:child_process');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

class Browser {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.root = fs.mkdtempSync(path.join(os.tmpdir(), 'omniconvert-docs-'));
    this.downloadDir = path.join(this.root, 'downloads');
    this.profile = path.join(this.root, 'chrome');
    fs.mkdirSync(this.downloadDir); fs.mkdirSync(this.profile);
    this.pending = new Map();
    this.sequence = 0;
    this.downloads = [];
    this.errors = [];
    this.posts = [];
  }

  async start() {
    const executable = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(file => file && fs.existsSync(file));
    if (!executable) throw new Error('Set CHROME_PATH to Chrome, Edge, or Chromium.');
    try { await fetch(this.baseUrl, { signal: AbortSignal.timeout(10000) }); }
    catch { throw new Error(`Start the app first, or set TEST_BASE_URL (currently ${this.baseUrl}).`); }
    this.process = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--remote-debugging-port=0', `--user-data-dir=${this.profile}`, 'about:blank'], { stdio: 'ignore', windowsHide: true });
    let port;
    for (let count = 0; count < 150 && !port; count++) {
      await sleep(100);
      try { port = Number(fs.readFileSync(path.join(this.profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]); } catch {}
    }
    if (!port) throw new Error('The isolated Chrome session did not start.');
    const version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
    this.ws = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { this.ws.onopen = resolve; this.ws.onerror = reject; });
    this.ws.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const item = this.pending.get(message.id);
        clearTimeout(item.timer); this.pending.delete(message.id);
        message.error ? item.reject(new Error(message.error.message)) : item.resolve(message.result);
      }
      if (message.method === 'Browser.downloadWillBegin') this.downloads.push({ ...message.params, state: 'started' });
      if (message.method === 'Browser.downloadProgress') {
        const item = this.downloads.find(item => item.guid === message.params.guid);
        if (item) Object.assign(item, message.params);
      }
      if (message.method === 'Runtime.exceptionThrown') this.errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      if (message.method === 'Network.requestWillBeSent' && message.params.request.method !== 'GET') this.posts.push(message.params.request.url);
    };
    await this.send('Browser.setDownloadBehavior', { behavior: 'allowAndName', downloadPath: this.downloadDir, eventsEnabled: true }, null);
    await this.send('Browser.grantPermissions', { origin: this.baseUrl, permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'] }, null);
    const target = await this.send('Target.createTarget', { url: 'about:blank' }, null);
    this.session = (await this.send('Target.attachToTarget', { targetId: target.targetId, flatten: true }, null)).sessionId;
    await this.send('Page.enable'); await this.send('Runtime.enable'); await this.send('Network.enable');
    await this.resize(1440, 900);
    await this.send('Page.bringToFront');
  }

  send(method, params = {}, session = this.session) {
    return new Promise((resolve, reject) => {
      const id = ++this.sequence;
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`Browser timeout: ${method}`)); }, 45000);
      this.pending.set(id, { resolve, reject, timer });
      this.ws.send(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }));
    });
  }

  async eval(expression) {
    const result = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result?.value;
  }

  async wait(expression, timeout = 30000) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      if (await this.eval(`Boolean(${expression})`)) return;
      await sleep(100);
    }
    throw new Error(`Timed out waiting for ${expression}. Current alerts: ${await this.eval("[...document.querySelectorAll('[role=alert]')].map(el=>el.textContent).join('; ')")}`);
  }

  async goto(route) {
    await this.send('Page.navigate', { url: this.baseUrl + route });
    await this.wait("document.readyState === 'complete' && document.querySelector('main h1')", 60000);
    await sleep(600);
  }

  async click(selector) { await this.eval(`document.querySelector(${JSON.stringify(selector)}).click()`); await sleep(100); }

  async set(selector, value) {
    await this.eval(`(() => {const el=document.querySelector(${JSON.stringify(selector)});const proto=el.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,${JSON.stringify(String(value))});el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);
    await sleep(100);
  }

  async upload(files) {
    await this.eval(`(() => { const data=new DataTransfer();for(const item of ${JSON.stringify(files.map(file => ({ name: file.name, type: file.type, data: Buffer.from(file.bytes).toString('base64') })))}) data.items.add(new File([Uint8Array.from(atob(item.data),c=>c.charCodeAt(0))],item.name,{type:item.type}));const input=document.querySelector('input[type=file]');input.files=data.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    await sleep(150);
  }

  async download(selector) {
    const before = this.downloads.length;
    await this.click(selector);
    for (let count = 0; count < 150; count++) {
      const item = this.downloads.slice(before).find(item => item.state === 'completed');
      if (item && fs.existsSync(path.join(this.downloadDir, item.guid))) return { name: item.suggestedFilename, bytes: fs.readFileSync(path.join(this.downloadDir, item.guid)) };
      await sleep(100);
    }
    throw new Error(`No completed download from ${selector}`);
  }

  async resize(width, height) { await this.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 }); }

  async close() {
    for (const item of this.pending.values()) { clearTimeout(item.timer); item.reject(new Error('Browser closed')); }
    this.pending.clear();
    try { this.ws?.close(); } catch {}
    if (this.process?.pid) {
      try {
        if (process.platform === 'win32') execFileSync('taskkill', ['/PID', String(this.process.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
        else this.process.kill('SIGTERM');
      } catch {}
    }
    const root = path.resolve(this.root);
    if (path.dirname(root) === path.resolve(os.tmpdir()) && path.basename(root).startsWith('omniconvert-docs-')) {
      try { fs.rmSync(root, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch {}
    }
  }
}

module.exports = { Browser, sleep };
