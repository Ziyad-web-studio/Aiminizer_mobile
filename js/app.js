import { loadProviders, createClient } from "https://g4f.dev/dist/js/providers.js";
import { animate, scrambleText } from "https://esm.sh/animejs@4";

const ui = {
    chat: document.getElementById('chatContainer'),
    input: document.getElementById('chatInput'),
    send: document.getElementById('sendBtn'),
    pS: document.getElementById('providerSelect'),
    aK: document.getElementById('apiKeyInput'),
    dot: document.getElementById('statusDot'),
    mLabel: document.getElementById('currentModelLabel'),
    mDrop: document.getElementById('modelDropdown'),
    mSelectBtn: document.getElementById('modelSelector'),
    fChip: document.getElementById('fileChip'),
    fName: document.getElementById('fileName'),
    fUpload: document.getElementById('fileUpload'),
    sidebar: document.getElementById('sidebar'),
    overlay: document.getElementById('sidebarOverlay'),
    historyList: document.getElementById('historyList'),
    cookieConsent: document.getElementById('cookieConsent')
};

let client = null;
let messages = [];
let attachedFile = { name: '', content: '' };
let currentModelId = '';
let currentChatId = null;
let userScrolledUp = false;

// --- COOKIE & MODAL LOGIC ---
window.toggleModal = (id, show) => {
    document.getElementById(id).classList.toggle('active', show);
};

window.acceptCookies = () => {
    localStorage.setItem('aiminizer_cookies_accepted', 'true');
    ui.cookieConsent.classList.remove('active');
};

function checkCookieConsent() {
    if (!localStorage.getItem('aiminizer_cookies_accepted')) {
        setTimeout(() => ui.cookieConsent.classList.add('active'), 1500);
    }
}

// --- HISTORY LOGIC ---
function saveChatHistory() {
    if (messages.length === 0) return;
    
    let history = JSON.parse(localStorage.getItem('aiminizer_history') || '[]');
    const chatData = {
        id: currentChatId || Date.now(),
        title: messages[0].content.slice(0, 40) + (messages[0].content.length > 40 ? '...' : ''),
        messages: messages,
        timestamp: new Date().toISOString()
    };

    const existingIndex = history.findIndex(h => h.id === chatData.id);
    if (existingIndex !== -1) {
        history[existingIndex] = chatData;
    } else {
        history.unshift(chatData);
    }

    // Limit to 20 chats
    if (history.length > 20) history.pop();
    
    localStorage.setItem('aiminizer_history', JSON.stringify(history));
    currentChatId = chatData.id;
    renderHistoryList();
}

function renderHistoryList() {
    const history = JSON.parse(localStorage.getItem('aiminizer_history') || '[]');
    ui.historyList.innerHTML = '';
    
    history.forEach(chat => {
        const date = new Date(chat.timestamp);
        const timeStr = date.toLocaleDateString() + ' ' + date.getHours() + ':' + date.getMinutes();
        
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div class="title">${escapeHTML(chat.title)}</div>
            <div class="time">${timeStr}</div>
            <i class="fas fa-trash-alt delete-chat" onclick="event.stopPropagation(); deleteChat(${chat.id})"></i>
        `;
        item.onclick = () => loadChat(chat.id);
        ui.historyList.appendChild(item);
    });
}

window.loadChat = (id) => {
    const history = JSON.parse(localStorage.getItem('aiminizer_history') || '[]');
    const chat = history.find(h => h.id === id);
    if (chat) {
        messages = [...chat.messages];
        currentChatId = chat.id;
        ui.chat.innerHTML = '';
        
        messages.forEach(msg => {
            const isUser = msg.role === 'user';
            const timeStr = '--:--'; // Time not stored per message yet
            
            if (isUser) {
                ui.chat.insertAdjacentHTML('beforeend', `
                    <div class="message user">
                        <div class="bubble" onclick="copyMessage(this)">${escapeHTML(msg.content)}</div>
                        <div class="timestamp">${timeStr}</div>
                    </div>
                `);
            } else {
                const assistantDiv = document.createElement('div');
                assistantDiv.className = 'message assistant';
                assistantDiv.innerHTML = `
                    <div class="bubble" onclick="copyMessage(this)"><div class="markdown-body"></div></div>
                    <div class="timestamp">${timeStr}</div>
                `;
                ui.chat.appendChild(assistantDiv);
                renderFinal(assistantDiv.querySelector('.markdown-body'), msg.content);
            }
        });
        toggleSidebar();
        scrollToBottom(true);
    }
};

window.deleteChat = (id) => {
    let history = JSON.parse(localStorage.getItem('aiminizer_history') || '[]');
    history = history.filter(h => h.id !== id);
    localStorage.setItem('aiminizer_history', JSON.stringify(history));
    if (currentChatId === id) {
        newChat();
    }
    renderHistoryList();
};

window.clearAllHistory = () => {
    if (confirm('Hapus semua riwayat percakapan?')) {
        localStorage.removeItem('aiminizer_history');
        newChat();
        renderHistoryList();
    }
};

window.showToast = (msg) => {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').innerText = msg;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3000);
};

window.newChat = () => {
    if (messages.length > 0) {
        messages = [];
        currentChatId = null;
        ui.chat.innerHTML = `
            <div style="text-align: center; margin: auto; opacity: 0.6; transition: 0.3s;">
                <img src="asset/android-chrome-192x192.png" alt="Logo aiminizer" style="width: 80px; height: 80px; object-fit: contain; margin-bottom: 16px;">
                <p class="mono">Sistem Siap</p>
            </div>
        `;
        window.showToast("Anda membuat percakapan baru");
    } else {
        window.showToast("Layar sudah bersih");
    }
};

const SCROLL_THRESHOLD = 80;
ui.chat.addEventListener('scroll', () => {
    const distFromBottom = ui.chat.scrollHeight - ui.chat.scrollTop - ui.chat.clientHeight;
    userScrolledUp = distFromBottom > SCROLL_THRESHOLD;
    const btn = document.getElementById('scrollDownBtn');
    if (userScrolledUp) {
        btn.classList.add('visible');
    } else {
        btn.classList.remove('visible');
    }
});

window.scrollToBottom = (force = false) => {
    userScrolledUp = false;
    document.getElementById('scrollDownBtn').classList.remove('visible');
    ui.chat.scrollTo({ top: ui.chat.scrollHeight, behavior: force ? 'smooth' : 'instant' });
};

function smartScroll() {
    if (!userScrolledUp) {
        ui.chat.scrollTop = ui.chat.scrollHeight;
    }
}

window.toggleSidebar = () => {
    ui.sidebar.classList.toggle('active');
    ui.overlay.classList.toggle('active');
};

ui.mSelectBtn.onclick = (e) => { e.stopPropagation(); ui.mDrop.classList.toggle('active'); };
document.addEventListener('click', (e) => { if(!ui.mDrop.contains(e.target) && e.target !== ui.mSelectBtn) ui.mDrop.classList.remove('active'); });

marked.use({
    renderer: {
        code(token) {
            const lang = token.lang || '';
            const code = token.text;
            const highlighted = lang && hljs.getLanguage(lang)
                ? hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
                : hljs.highlightAuto(code).value;
            return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
        }
    }
});

async function initSystem() {
    const providers = await loadProviders();
    ui.pS.innerHTML = '';
    Object.keys(providers).forEach(key => ui.pS.appendChild(new Option(key, key)));
    if (providers["DeepInfra"]) ui.pS.value = "DeepInfra";
    await updateClient();
    renderHistoryList();
    checkCookieConsent();
}

async function updateClient() {
    ui.dot.style.background = "#f1c40f";
    ui.mLabel.innerText = "Memuat...";
    const provider = ui.pS.value;
    const apiKey = ui.aK.value.trim();
    client = await createClient(provider, apiKey ? { apiKey } : {});
    await loadModels();
}

let availableModels = [];

async function loadModels() {
    ui.mDrop.innerHTML = '<div class="drop-item"><strong>Fetching...</strong></div>';
    try {
        const models = await client.models.list();
        ui.mDrop.innerHTML = '';
        const filtered = models.filter(m => !m.type || ["chat", "text"].includes(m.type));
        availableModels = filtered.length > 0 ? filtered : models;
        const preferred = availableModels.find(m => m.id === client.defaultModel) || availableModels[0];
        if (preferred) {
            currentModelId = preferred.id;
            ui.mLabel.innerText = preferred.id.split('/').pop().toUpperCase();
        }
        availableModels.forEach(m => {
            const item = document.createElement('div');
            item.className = 'drop-item' + (m.id === currentModelId ? ' active' : '');
            item.innerHTML = `<strong>${m.id.split('/').pop()}</strong><span class="mono" style="font-size:0.65rem;">${m.id}</span>`;
            item.onclick = () => {
                document.querySelectorAll('#modelDropdown .drop-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                currentModelId = m.id;
                ui.mLabel.innerText = m.id.split('/').pop().toUpperCase();
                ui.mDrop.classList.remove('active');
            };
            ui.mDrop.appendChild(item);
        });
        if (availableModels.length === 0) {
            ui.mDrop.innerHTML = '<div class="drop-item"><strong>Tidak ada model tersedia</strong></div>';
            ui.mLabel.innerText = "No Models";
        }
        ui.dot.style.background = "#2ecc71";
    } catch (err) {
        ui.mLabel.innerText = "Error";
        ui.dot.style.background = "#e74c3c";
    }
}

function switchToNextModel(failedModelId) {
    const currentIdx = availableModels.findIndex(m => m.id === failedModelId);
    if (currentIdx === -1 || availableModels.length <= 1) return null;
    const nextIdx = (currentIdx + 1) % availableModels.length;
    const nextModel = availableModels[nextIdx];
    currentModelId = nextModel.id;
    ui.mLabel.innerText = nextModel.id.split('/').pop().toUpperCase();
    document.querySelectorAll('#modelDropdown .drop-item').forEach((el, i) => {
        el.classList.toggle('active', i === nextIdx);
    });
    return nextModel.id;
}
ui.aK.onchange = updateClient;

ui.fUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        attachedFile = { name: file.name, content: event.target.result };
        ui.fName.innerText = file.name;
        ui.fChip.style.display = 'flex';
    };
    reader.readAsText(file);
    this.value = '';
});

window.clearFile = () => {
    attachedFile = { name: '', content: '' };
    ui.fChip.style.display = 'none';
};

function getCurrentTime() {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
}

window.copyMessage = function(bubbleElement) {
    const markdownBody = bubbleElement.querySelector('.markdown-body');
    const textToCopy = markdownBody ? markdownBody.innerText : bubbleElement.innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
        const timeContainer = bubbleElement.nextElementSibling;
        if (timeContainer && timeContainer.classList.contains('timestamp')) {
            const originalTime = timeContainer.innerText;
            timeContainer.innerText = "Tersalin!";
            timeContainer.style.color = "#2ecc71";
            setTimeout(() => {
                timeContainer.innerText = originalTime;
                timeContainer.style.color = "var(--text-dim)";
            }, 2000);
        }
    });
};

function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function extractThink(rawText) {
    const thinkRegex = /(<think>)([\s\S]*?)(<\/think>)/gi;
    const hasClose = thinkRegex.test(rawText);
    thinkRegex.lastIndex = 0;
    const openIdx = rawText.search(/<think>/i);
    const closeIdx = rawText.search(/<\/think>/i);
    const inProgress = openIdx !== -1 && closeIdx === -1;
    let thinkContent = '', mainContent = rawText;
    if (hasClose || inProgress) {
        if (inProgress) {
            thinkContent = rawText.slice(openIdx + 7);
            mainContent = rawText.slice(0, openIdx);
        } else {
            mainContent = rawText.replace(thinkRegex, (_, _o, inner) => {
                thinkContent += inner; return '';
            }).trim();
        }
    }
    return { thinkContent, mainContent, inProgress };
}

function buildThinkHTML(thinkContent, inProgress, container) {
    const isOpen = container.querySelector('.thinking-toggle.open') !== null;
    const label = inProgress ? 'Sedang berpikir...' : 'Lihat pemikiran AI';
    const spin = inProgress ? ` <i class="fas fa-circle-notch think-spinner" style="font-size:0.75rem;"></i>` : '';
    return `<div class="thinking-block">
        <button class="thinking-toggle${isOpen ? ' open' : ''}" onclick="event.stopPropagation(); this.classList.toggle('open'); const c=this.nextElementSibling; c.classList.toggle('open');">
            <i class="fas fa-brain think-icon"></i>
            <span>${label}${spin}</span>
            <i class="fas fa-chevron-down think-chevron"></i>
        </button>
        <div class="thinking-content${isOpen ? ' open' : ''}">${escapeHTML(thinkContent)}</div>
    </div>`;
}

function renderFinal(container, rawText) {
    const { thinkContent, mainContent } = extractThink(rawText);
    let html = '';
    if (thinkContent) html += buildThinkHTML(thinkContent, false, container);
    if (mainContent.trim()) html += `<div class="main-response">${marked.parse(mainContent)}</div>`;
    container.innerHTML = html;
    container.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
    if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(container, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$',  right: '$',  display: false },
                { left: '\\(', right: '\\)', display: false },
                { left: '\\[', right: '\\]', display: true }
            ],
            throwOnError: false
        });
    }
}

function createTypewriter(container) {
    let displayed = '';
    let queued    = '';
    let timer     = null;
    let done      = false;
    let onDoneCb  = null;
    let started   = false;
    const thinkEl = document.createElement('div');
    const mainEl  = document.createElement('div');

    function updateThinkBlock(thinkContent, inProgress) {
        let block = thinkEl.querySelector('.thinking-block');
        if (!block) {
            block = document.createElement('div');
            block.className = 'thinking-block';
            block.innerHTML = `
                <button class="thinking-toggle" onclick="event.stopPropagation(); this.classList.toggle('open'); const c=this.nextElementSibling; c.classList.toggle('open');">
                    <i class="fas fa-brain think-icon"></i>
                    <span class="think-label">Sedang berpikir...</span>
                    <i class="fas fa-loading-spin fas fa-circle-notch think-spinner" style="font-size:0.75rem; margin-left:4px;"></i>
                    <i class="fas fa-chevron-down think-chevron"></i>
                </button>
                <div class="thinking-content"></div>`;
            thinkEl.appendChild(block);
        }
        const labelEl   = block.querySelector('.think-label');
        const spinnerEl = block.querySelector('.think-spinner');
        const contentEl = block.querySelector('.thinking-content');
        if (!inProgress) {
            if (labelEl)   labelEl.textContent = 'Lihat pemikiran AI';
            if (spinnerEl) spinnerEl.style.display = 'none';
        } else {
            if (labelEl)   labelEl.textContent = 'Sedang berpikir...';
            if (spinnerEl) spinnerEl.style.display = '';
        }
        if (contentEl) contentEl.textContent = thinkContent;
    }

    const dotsEl = document.createElement('div');
    dotsEl.className = 'typing-indicator';
    dotsEl.style.padding = '6px 0';
    dotsEl.innerHTML = `<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>`;

    function flush() {
        if (!queued.length) {
            timer = null;
            if (done && onDoneCb) onDoneCb();
            return;
        }
        const take = Math.min(2, queued.length);
        displayed += queued.slice(0, take);
        queued     = queued.slice(take);
        const { thinkContent, mainContent, inProgress } = extractThink(displayed);
        if (thinkContent || inProgress) {
            updateThinkBlock(thinkContent, inProgress);
        } else {
            thinkEl.innerHTML = '';
        }
        if (mainContent.trim()) {
            if (dotsEl.parentNode === mainEl) mainEl.removeChild(dotsEl);
            const inCode = (mainContent.match(/```/g) || []).length % 2 !== 0;
            let parsed = marked.parse(mainContent);
            if (!inCode) {
                parsed = parsed.replace(/(<\/(?:p|li|h[1-6])>)(\s*)$/, '<span class="tw-cursor">▋</span>$1$2');
            }
            mainEl.innerHTML = `<div class="main-response">${parsed}</div>`;
            mainEl.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
        } else if (inProgress) {
            if (dotsEl.parentNode !== mainEl) {
                mainEl.innerHTML = '';
                mainEl.appendChild(dotsEl);
            }
        } else {
            if (dotsEl.parentNode === mainEl) mainEl.removeChild(dotsEl);
            mainEl.innerHTML = '';
        }
        timer = setTimeout(flush, 18);
    }

    return {
        push(text) {
            if (!started) {
                started = true;
                container.innerHTML = '';
                container.appendChild(thinkEl);
                container.appendChild(mainEl);
            }
            queued += text;
            if (!timer) timer = setTimeout(flush, 18);
        },
        finish(cb) {
            done = true;
            onDoneCb = cb;
            if (!timer && !queued.length) cb();
        },
        abort() {
            clearTimeout(timer);
            timer = null;
        },
        getDisplayed() { return displayed + queued; }
    };
}

async function handleSend() {
    const text = ui.input.value.trim();
    if (!text && !attachedFile.content) return;
    if (!client || !currentModelId) return;
    let promptKirim = text;
    if (attachedFile.content) {
        promptKirim = `[Dokumen Terlampir: ${attachedFile.name}]\n\`\`\`\n${attachedFile.content}\n\`\`\`\n\nPesan Pengguna: ${text || 'Tolong analisis kode/teks di atas.'}`;
    }
    if (messages.length === 0) ui.chat.innerHTML = '';
    const timeStr = getCurrentTime();
    const displayFileName = attachedFile.name;
    ui.chat.insertAdjacentHTML('beforeend', `
        <div class="message user">
            <div class="bubble" onclick="copyMessage(this)" title="Ketuk untuk salin">${escapeHTML(text) || 'Mengirim dokumen: ' + escapeHTML(displayFileName)}</div>
            <div class="timestamp">${timeStr}</div>
        </div>
    `);
    messages.push({ role: 'user', content: promptKirim });
    ui.input.value = '';
    ui.input.style.height = 'auto';
    clearFile();
    scrollToBottom();
    const astTimeStr = getCurrentTime();
    const assistantDiv = document.createElement('div');
    assistantDiv.className = 'message assistant';
    assistantDiv.innerHTML = `
        <div class="bubble" onclick="copyMessage(this)" title="Ketuk untuk salin"><div class="markdown-body"><div class="typing-indicator"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div></div></div>
        <div class="timestamp">${astTimeStr}</div>
    `;
    ui.chat.appendChild(assistantDiv);
    const targetRender = assistantDiv.querySelector('.markdown-body');
    ui.send.disabled = true;
    ui.send.classList.add('loading');
    ui.send.innerHTML = '<i class="fas fa-circle-notch fa-spin" style="font-size:0.9rem;"></i>';
    ui.dot.style.background = "#3498db";
    const MAX_RETRIES = availableModels.length > 1 ? Math.min(availableModels.length - 1, 3) : 2;
    let attempt = 0;
    let success = false;
    let triedModels = new Set();
    while (attempt <= MAX_RETRIES && !success) {
        attempt++;
        targetRender.innerHTML = '';
        const waitingDots = document.createElement('div');
        waitingDots.className = 'typing-indicator';
        waitingDots.innerHTML = attempt > 1
            ? `<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span><span style="font-size:0.8rem;color:var(--text-dim);margin-left:6px;">Mencoba ulang (${attempt}/${MAX_RETRIES + 1})...</span>`
            : `<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>`;
        targetRender.appendChild(waitingDots);
        try {
            const abortCtrl = new AbortController();
            let firstChunkTimer = setTimeout(() => abortCtrl.abort(), 30000);
            const stream = await client.chat.completions.create({
                model: currentModelId,
                messages,
                stream: true,
                signal: abortCtrl.signal
            });
            let fullText = '';
            let lastChunkTime = Date.now();
            const tw = createTypewriter(targetRender);
            const watchdog = setInterval(() => {
                if (Date.now() - lastChunkTime > 20000) {
                    clearInterval(watchdog);
                    abortCtrl.abort();
                }
            }, 2000);
            for await (const chunk of stream) {
                clearTimeout(firstChunkTimer);
                lastChunkTime = Date.now();
                const delta = chunk.choices[0]?.delta?.content || '';
                fullText += delta;
                tw.push(delta);
                smartScroll();
            }
            clearInterval(watchdog);
            if (!fullText.trim()) {
                tw.abort();
                triedModels.add(currentModelId);
                if (attempt <= MAX_RETRIES) {
                    const failedModel = currentModelId;
                    const nextModel = switchToNextModel(failedModel);
                    const notif = nextModel
                        ? `<i class="fas fa-random"></i> Model <b>${failedModel.split('/').pop()}</b> tidak merespon, beralih ke <b>${nextModel.split('/').pop()}</b>...`
                        : `<i class="fas fa-sync"></i> Mencoba ulang...`;
                    targetRender.innerHTML = `<span style="color:var(--text-dim);font-size:0.85rem;">${notif}</span>`;
                    await new Promise(r => setTimeout(r, 1200));
                    continue;
                } else {
                    targetRender.innerHTML = `<span style="color: var(--text-dim)"><i class="fas fa-exclamation-circle"></i> Semua model tidak merespon. Coba provider lain.</span>`;
                    ui.dot.style.background = "#e67e22";
                    break;
                }
            }
            await new Promise(resolve => tw.finish(resolve));
            renderFinal(targetRender, fullText);
            const cleanForHistory = fullText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            messages.push({ role: 'assistant', content: cleanForHistory });
            ui.dot.style.background = "#2ecc71";
            success = true;
            saveChatHistory();
        } catch (err) {
            const isAbort = err.name === 'AbortError';
            triedModels.add(currentModelId);
            if (attempt <= MAX_RETRIES) {
                const failedModel = currentModelId;
                const nextModel = switchToNextModel(failedModel);
                const notif = nextModel
                    ? `<i class="fas fa-random"></i> Model <b>${failedModel.split('/').pop()}</b> ${isAbort ? 'timeout' : 'error'}, beralih ke <b>${nextModel.split('/').pop()}</b>...`
                    : `<i class="fas fa-sync"></i> Mencoba ulang...`;
                targetRender.innerHTML = `<span style="color:var(--text-dim);font-size:0.85rem;">${notif}</span>`;
                await new Promise(r => setTimeout(r, 1200));
            } else {
                targetRender.innerHTML = `<span style="color: #e74c3c"><i class="fas fa-wifi"></i> Semua model gagal. Coba provider lain.</span>`;
                ui.dot.style.background = "#e74c3c";
                break;
            }
        }
    }
    ui.send.disabled = false;
    ui.send.classList.remove('loading');
    ui.send.innerHTML = '<i class="fas fa-arrow-up"></i>';
    ui.dot.style.background = success ? "#2ecc71" : ui.dot.style.background;
}

ui.send.onclick = handleSend;
ui.input.onkeydown = (e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
ui.input.oninput = function() { this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px'; };

initSystem();
