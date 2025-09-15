document.addEventListener('DOMContentLoaded', () => {
    const statusEl = document.getElementById('status');
    const portInput = document.getElementById('port');
    const saveBtn = document.getElementById('saveSettingsBtn');
    const sendCookieBtn = document.getElementById('sendCookieBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    let initialPort = 80;

    // Load current settings
    chrome.storage.local.get(['wplacerPort'], (result) => {
        initialPort = result.wplacerPort || 80;
        portInput.value = initialPort;
    });

    // Save settings
    saveBtn.addEventListener('click', () => {
        const port = parseInt(portInput.value, 10);
        if (isNaN(port) || port < 1 || port > 65535) {
            statusEl.textContent = 'Error: 无效的端口';
            return;
        }

        chrome.storage.local.set({ wplacerPort: port }, () => {
            statusEl.textContent = `设置已保存。服务器端口在 ${port}.`;
            // Inform background script if port changed, so it can reconnect SSE
            if (port !== initialPort) {
                chrome.runtime.sendMessage({ action: "settingsUpdated" });
                initialPort = port;
            }
        });
    });

    // Manually send cookie
    sendCookieBtn.addEventListener('click', () => {
        statusEl.textContent = '正在将cookie发送到服务器...';
        chrome.runtime.sendMessage({ action: "sendCookie" }, (response) => {
            if (chrome.runtime.lastError) {
                statusEl.textContent = `Error: ${chrome.runtime.lastError.message}`;
                return;
            }
            if (response.success) {
                statusEl.textContent = `Success! 用户: ${response.name}.`;
            } else {
                statusEl.textContent = `Error: ${response.error}`;
            }
        });
    });

    // Quick logout
    logoutBtn.addEventListener('click', () => {
        statusEl.textContent = '正在退出登录...';
        chrome.runtime.sendMessage({ action: "quickLogout" }, (response) => {
            if (chrome.runtime.lastError) {
                statusEl.textContent = `Error: ${chrome.runtime.lastError.message}`;
                return;
            }
            if (response.success) {
                statusEl.textContent = '注销成功。网站数据已清除。';
            } else {
                statusEl.textContent = `Error: ${response.error}`;
            }
        });
    });
});