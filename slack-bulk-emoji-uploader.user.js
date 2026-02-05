// ==UserScript==
// @name         Slack Bulk Emoji Uploader
// @namespace    https://slack.com/
// @version      1.2.1
// @description  Bulk upload emojis to Slack with rename support
// @author       You
// @match        https://*.slack.com/customize/emoji*
// @match        https://app.slack.com/client/*/customize/emoji*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Styles for the upload UI
    const styles = `
        .bulk-emoji-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .bulk-emoji-modal {
            background: #1a1d21;
            color: #d1d2d3;
            border-radius: 12px;
            padding: 24px;
            max-width: 800px;
            max-height: 80vh;
            width: 90%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        .bulk-emoji-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid #363940;
        }
        .bulk-emoji-title {
            font-size: 20px;
            font-weight: 700;
            color: #fff;
        }
        .bulk-emoji-close {
            background: none;
            border: none;
            color: #d1d2d3;
            font-size: 24px;
            cursor: pointer;
            padding: 4px 8px;
        }
        .bulk-emoji-close:hover {
            color: #fff;
        }
        .bulk-emoji-list {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 16px;
        }
        .bulk-emoji-item {
            display: flex;
            align-items: center;
            padding: 12px;
            background: #222529;
            border-radius: 8px;
            margin-bottom: 8px;
            gap: 16px;
        }
        .bulk-emoji-item.error {
            border: 1px solid #e01e5a;
        }
        .bulk-emoji-item.success {
            border: 1px solid #2eb67d;
            opacity: 0.7;
        }
        .bulk-emoji-item.uploading {
            border: 1px solid #36c5f0;
        }
        .bulk-emoji-preview {
            width: 48px;
            height: 48px;
            object-fit: contain;
            background: #363940;
            border-radius: 4px;
            padding: 4px;
        }
        .bulk-emoji-name-input {
            flex: 1;
            background: #1a1d21 !important;
            border: 1px solid #363940;
            border-radius: 4px;
            padding: 8px 12px;
            color: #ffffff !important;
            font-size: 14px;
            -webkit-text-fill-color: #ffffff !important;
        }
        .bulk-emoji-name-input:focus {
            outline: none;
            border-color: #1264a3;
        }
        .bulk-emoji-name-input.invalid {
            border-color: #e01e5a;
        }
        .bulk-emoji-status {
            font-size: 12px;
            min-width: 80px;
            text-align: right;
        }
        .bulk-emoji-status.error {
            color: #e01e5a;
        }
        .bulk-emoji-status.success {
            color: #2eb67d;
        }
        .bulk-emoji-status.uploading {
            color: #36c5f0;
        }
        .bulk-emoji-remove {
            background: none;
            border: none;
            color: #e01e5a;
            cursor: pointer;
            padding: 4px 8px;
            font-size: 18px;
        }
        .bulk-emoji-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 16px;
            border-top: 1px solid #363940;
        }
        .bulk-emoji-count {
            color: #9e9ea6;
            font-size: 14px;
        }
        .bulk-emoji-actions {
            display: flex;
            gap: 12px;
        }
        .bulk-emoji-btn {
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: background 0.2s;
        }
        .bulk-emoji-btn-primary {
            background: #007a5a;
            color: #fff;
        }
        .bulk-emoji-btn-primary:hover {
            background: #148567;
        }
        .bulk-emoji-btn-primary:disabled {
            background: #363940;
            color: #9e9ea6;
            cursor: not-allowed;
        }
        .bulk-emoji-btn-secondary {
            background: #363940;
            color: #d1d2d3;
        }
        .bulk-emoji-btn-secondary:hover {
            background: #464b53;
        }
        .bulk-upload-trigger {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: #007a5a;
            color: #fff;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            margin-left: 12px;
        }
        .bulk-upload-trigger:hover {
            background: #148567;
        }
        .bulk-emoji-dropzone {
            border: 2px dashed #363940;
            border-radius: 8px;
            padding: 40px;
            text-align: center;
            margin-bottom: 16px;
            transition: all 0.2s;
        }
        .bulk-emoji-dropzone.dragover {
            border-color: #1264a3;
            background: rgba(18, 100, 163, 0.1);
        }
        .bulk-emoji-dropzone-text {
            color: #9e9ea6;
            margin-bottom: 12px;
        }
        .bulk-emoji-browse {
            color: #1264a3;
            cursor: pointer;
            text-decoration: underline;
        }
        .bulk-emoji-toast {
            position: absolute;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: #e01e5a;
            color: #fff;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
            max-width: 80%;
            text-align: center;
        }
        .bulk-emoji-toast.visible {
            opacity: 1;
        }
    `;

    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // State
    let emojis = [];
    let isUploading = false;

    // Get the API token from the page
    function getApiToken() {
        // Try to find token in boot_data or other global vars
        if (window.boot_data && window.boot_data.api_token) {
            return window.boot_data.api_token;
        }
        // Try localStorage
        const localToken = localStorage.getItem('localConfig_v2');
        if (localToken) {
            try {
                const parsed = JSON.parse(localToken);
                if (parsed.teams) {
                    const team = Object.values(parsed.teams)[0];
                    if (team && team.token) return team.token;
                }
            } catch (e) {}
        }
        // Try to extract from page scripts
        const scripts = document.querySelectorAll('script');
        for (const script of scripts) {
            const match = script.textContent.match(/"api_token":"(xoxc-[^"]+)"/);
            if (match) return match[1];
        }
        return null;
    }

    // Sanitize emoji name
    function sanitizeEmojiName(name) {
        return name
            .toLowerCase()
            .replace(/\.[^.]+$/, '') // Remove file extension
            .replace(/[^a-z0-9_-]/g, '_') // Replace invalid chars with underscore
            .replace(/_+/g, '_') // Collapse multiple underscores
            .replace(/^_|_$/g, ''); // Trim underscores from ends
    }

    // Validate emoji name
    function isValidEmojiName(name) {
        return /^[a-z0-9][a-z0-9_-]*[a-z0-9]$|^[a-z0-9]$/.test(name) && name.length >= 1 && name.length <= 100;
    }

    // Extract image URL from dataTransfer (for images dragged from other browser windows)
    function extractImageUrl(dataTransfer) {
        // Try to get URL directly
        const url = dataTransfer.getData('text/uri-list') || dataTransfer.getData('text/plain');
        if (url && /^https?:\/\/.+\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url)) {
            return url;
        }

        // Try to extract from HTML (img src)
        const html = dataTransfer.getData('text/html');
        if (html) {
            const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (match && match[1]) {
                return match[1];
            }
        }

        return null;
    }

    // Extract filename from URL
    function getFilenameFromUrl(url) {
        try {
            const pathname = new URL(url).pathname;
            const filename = pathname.split('/').pop();
            return filename || 'image';
        } catch {
            return 'image';
        }
    }

    // Fetch image from URL and convert to File
    async function fetchImageAsFile(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) {
            throw new Error('URL did not return an image');
        }

        const filename = getFilenameFromUrl(url);
        return new File([blob], filename, { type: blob.type });
    }

    // Upload a single emoji
    async function uploadEmoji(emoji) {
        const token = getApiToken();
        if (!token) {
            throw new Error('Could not find API token. Make sure you are logged in.');
        }

        const formData = new FormData();
        formData.append('token', token);
        formData.append('name', emoji.name);
        formData.append('mode', 'data');
        formData.append('image', emoji.file);

        const response = await fetch('/api/emoji.add', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const result = await response.json();
        if (!result.ok) {
            throw new Error(result.error || 'Upload failed');
        }
        return result;
    }

    // Create the modal UI
    function createModal() {
        const overlay = document.createElement('div');
        overlay.className = 'bulk-emoji-overlay';
        overlay.innerHTML = `
            <div class="bulk-emoji-modal">
                <div class="bulk-emoji-header">
                    <span class="bulk-emoji-title">Bulk Emoji Upload</span>
                    <button class="bulk-emoji-close">&times;</button>
                </div>
                <div class="bulk-emoji-dropzone">
                    <div class="bulk-emoji-dropzone-text">
                        Drag & drop emoji images here, paste from clipboard, or <span class="bulk-emoji-browse">browse files</span>
                    </div>
                    <input type="file" multiple accept="image/*" style="display: none;" />
                </div>
                <div class="bulk-emoji-list"></div>
                <div class="bulk-emoji-footer">
                    <span class="bulk-emoji-count">0 emojis ready</span>
                    <div class="bulk-emoji-actions">
                        <button class="bulk-emoji-btn bulk-emoji-btn-secondary bulk-emoji-cancel">Cancel</button>
                        <button class="bulk-emoji-btn bulk-emoji-btn-primary bulk-emoji-upload" disabled>Upload All</button>
                    </div>
                </div>
                <div class="bulk-emoji-toast"></div>
            </div>
        `;

        const toastEl = overlay.querySelector('.bulk-emoji-toast');
        let toastTimeout = null;

        function showToast(message, duration = 4000) {
            toastEl.textContent = message;
            toastEl.classList.add('visible');
            if (toastTimeout) clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                toastEl.classList.remove('visible');
            }, duration);
        }

        const dropzone = overlay.querySelector('.bulk-emoji-dropzone');
        const fileInput = overlay.querySelector('input[type="file"]');
        const browseBtn = overlay.querySelector('.bulk-emoji-browse');
        const closeBtn = overlay.querySelector('.bulk-emoji-close');
        const cancelBtn = overlay.querySelector('.bulk-emoji-cancel');
        const uploadBtn = overlay.querySelector('.bulk-emoji-upload');
        const listEl = overlay.querySelector('.bulk-emoji-list');
        const countEl = overlay.querySelector('.bulk-emoji-count');

        // File selection
        browseBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

        // Drag and drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });
        dropzone.addEventListener('drop', async (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');

            // First try to handle as files (from file system)
            if (e.dataTransfer.files.length > 0) {
                handleFiles(e.dataTransfer.files);
                return;
            }

            // Try to handle as URL (from other browser windows)
            const imageUrl = extractImageUrl(e.dataTransfer);
            if (imageUrl) {
                dropzone.querySelector('.bulk-emoji-dropzone-text').textContent = 'Fetching image...';
                try {
                    const file = await fetchImageAsFile(imageUrl);
                    handleFiles([file]);
                } catch (err) {
                    console.error('Failed to fetch image from URL:', err);
                    showToast('Could not fetch image. The source may block external access (CORS).');
                }
                dropzone.querySelector('.bulk-emoji-dropzone-text').innerHTML =
                    'Drag & drop emoji images here, paste from clipboard, or <span class="bulk-emoji-browse">browse files</span>';
                dropzone.querySelector('.bulk-emoji-browse').addEventListener('click', () => fileInput.click());
            }
        });

        // Clipboard paste support
        overlay.addEventListener('paste', async (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            const imageFiles = [];
            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) {
                        // Generate a name since clipboard images don't have filenames
                        const ext = item.type.split('/')[1] || 'png';
                        const namedFile = new File([file], `pasted_image_${Date.now()}.${ext}`, { type: file.type });
                        imageFiles.push(namedFile);
                    }
                }
            }

            if (imageFiles.length > 0) {
                e.preventDefault();
                handleFiles(imageFiles);
            }
        });

        // Make overlay focusable to receive paste events
        overlay.setAttribute('tabindex', '-1');
        overlay.focus();

        // Close modal
        function closeModal() {
            overlay.remove();
            emojis = [];
            isUploading = false;
        }

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        // Handle file selection
        function handleFiles(files) {
            for (const file of files) {
                if (!file.type.startsWith('image/')) continue;

                const id = Date.now() + Math.random();
                const name = sanitizeEmojiName(file.name);
                const url = URL.createObjectURL(file);

                emojis.push({
                    id,
                    file,
                    name,
                    url,
                    status: 'pending',
                    error: null
                });
            }
            renderList();
        }

        // Render emoji list
        function renderList() {
            listEl.innerHTML = emojis.map(emoji => `
                <div class="bulk-emoji-item ${emoji.status}" data-id="${emoji.id}">
                    <img class="bulk-emoji-preview" src="${emoji.url}" alt="${emoji.name}" />
                    <input
                        type="text"
                        class="bulk-emoji-name-input ${isValidEmojiName(emoji.name) ? '' : 'invalid'}"
                        value="${emoji.name}"
                        placeholder="emoji_name"
                        ${emoji.status !== 'pending' ? 'disabled' : ''}
                    />
                    <span class="bulk-emoji-status ${emoji.status}">
                        ${emoji.status === 'pending' ? '' :
                          emoji.status === 'uploading' ? 'Uploading...' :
                          emoji.status === 'success' ? 'Done!' :
                          emoji.error || 'Error'}
                    </span>
                    ${emoji.status === 'pending' ?
                        '<button class="bulk-emoji-remove">&times;</button>' : ''}
                </div>
            `).join('');

            // Name input handlers
            listEl.querySelectorAll('.bulk-emoji-name-input').forEach(input => {
                input.addEventListener('input', (e) => {
                    const id = parseFloat(e.target.closest('.bulk-emoji-item').dataset.id);
                    const emoji = emojis.find(em => em.id === id);
                    if (emoji) {
                        emoji.name = e.target.value;
                        e.target.classList.toggle('invalid', !isValidEmojiName(emoji.name));
                        updateCount();
                    }
                });
            });

            // Remove handlers
            listEl.querySelectorAll('.bulk-emoji-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseFloat(e.target.closest('.bulk-emoji-item').dataset.id);
                    emojis = emojis.filter(em => em.id !== id);
                    renderList();
                });
            });

            updateCount();
        }

        // Update count and button state
        function updateCount() {
            const pending = emojis.filter(e => e.status === 'pending');
            const valid = pending.filter(e => isValidEmojiName(e.name));
            const done = emojis.filter(e => e.status === 'success').length;

            if (done > 0) {
                countEl.textContent = `${done}/${emojis.length} uploaded`;
            } else {
                countEl.textContent = `${valid.length} emoji${valid.length !== 1 ? 's' : ''} ready`;
            }

            uploadBtn.disabled = valid.length === 0 || isUploading;
            uploadBtn.textContent = isUploading ? 'Uploading...' :
                done > 0 ? 'Upload Remaining' : 'Upload All';
        }

        // Upload handler
        uploadBtn.addEventListener('click', async () => {
            if (isUploading) return;
            isUploading = true;
            updateCount();

            const pending = emojis.filter(e => e.status === 'pending' && isValidEmojiName(e.name));

            for (const emoji of pending) {
                emoji.status = 'uploading';
                renderList();

                try {
                    await uploadEmoji(emoji);
                    emoji.status = 'success';
                } catch (err) {
                    emoji.status = 'error';
                    emoji.error = err.message;
                }
                renderList();

                // Small delay between uploads to avoid rate limiting
                await new Promise(r => setTimeout(r, 500));
            }

            isUploading = false;
            updateCount();

            // If all successful, close after a moment
            if (emojis.every(e => e.status === 'success')) {
                setTimeout(() => {
                    closeModal();
                    location.reload(); // Refresh to show new emojis
                }, 1000);
            }
        });

        document.body.appendChild(overlay);
        return overlay;
    }

    // Add the bulk upload button to the page
    function addTriggerButton() {
        // Wait for the page to load the emoji form
        const checkInterval = setInterval(() => {
            // Look for the "Add Custom Emoji" section or similar
            const addButton = document.querySelector('[data-qa="customize_emoji_add_button"]') ||
                              document.querySelector('button[aria-label*="Add"]') ||
                              document.querySelector('.p-customize_emoji_wrapper button') ||
                              document.querySelector('[class*="add_emoji"]');

            // Also try to find the header area
            const header = document.querySelector('.p-customize_emoji_wrapper h1') ||
                           document.querySelector('[class*="emoji"] h1') ||
                           document.querySelector('.c-page_header');

            const targetEl = addButton?.parentElement || header?.parentElement;

            if (targetEl && !document.querySelector('.bulk-upload-trigger')) {
                const btn = document.createElement('button');
                btn.className = 'bulk-upload-trigger';
                btn.innerHTML = '+ Bulk Upload';
                btn.addEventListener('click', createModal);

                if (addButton) {
                    addButton.parentElement.insertBefore(btn, addButton.nextSibling);
                } else if (targetEl) {
                    targetEl.appendChild(btn);
                }

                clearInterval(checkInterval);
            }
        }, 1000);

        // Fallback: add floating button after timeout
        setTimeout(() => {
            if (!document.querySelector('.bulk-upload-trigger')) {
                clearInterval(checkInterval);
                const btn = document.createElement('button');
                btn.className = 'bulk-upload-trigger';
                btn.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 9999;';
                btn.innerHTML = '+ Bulk Upload Emojis';
                btn.addEventListener('click', createModal);
                document.body.appendChild(btn);
            }
        }, 5000);
    }

    // Initialize
    addTriggerButton();

    console.log('Slack Bulk Emoji Uploader loaded!');
})();
