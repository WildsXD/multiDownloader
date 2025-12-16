console.log('🎬 Video Downloader loaded with animations!');

// Form submission handler
document.getElementById('downloadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const url = document.getElementById('url').value;
    const platform = document.getElementById('platform').value;
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    const form = document.getElementById('downloadForm');

    // Show loading animation
    form.classList.add('form-loading');
    loadingDiv.classList.remove('hidden');
    resultDiv.innerHTML = '';

    try {
        const response = await fetch('/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url, platform })
        });

        // Hide loading
        loadingDiv.classList.add('hidden');
        form.classList.remove('form-loading');

        // Handle different HTTP status codes
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            showErrorAlert(response.status, errorData.message || 'Unknown error occurred');
            return;
        }

        const result = await response.json();

        if (result.success) {
            // Build video info HTML if available
            let videoInfoHTML = '';
            if (result.videoInfo) {
                const info = result.videoInfo;
                videoInfoHTML = `
                    <div class="video-info mb-6 text-left bg-white bg-opacity-5 rounded-lg p-4">
                        ${info.thumbnail ? `<img src="${info.thumbnail}" alt="Thumbnail" class="w-full rounded-lg mb-3">` : ''}
                        ${info.title ? `<h4 class="text-lg font-bold text-white mb-2">📹 ${info.title}</h4>` : ''}
                        <div class="grid grid-cols-2 gap-2 text-sm text-gray-300">
                            ${info.author ? `<div>👤 ${info.author}</div>` : ''}
                            ${info.duration ? `<div>⏱️ ${formatDuration(info.duration)}</div>` : ''}
                            ${info.views ? `<div>👁️ ${formatNumber(info.views)} views</div>` : ''}
                            <div>📱 ${result.platform}</div>
                        </div>
                    </div>
                `;
            }

            // Check if direct download is available
            if (result.downloadUrl && !result.fallbackMode) {
                // Direct download available
                resultDiv.innerHTML = `
                    <div class="success-card animate-scaleIn">
                        <div class="text-5xl mb-4 animate-bounce">✅</div>
                        <h3 class="text-2xl font-bold text-white mb-4">Video Ready!</h3>
                        ${videoInfoHTML}
                        <a href="${result.downloadUrl}" download class="btn-success group">
                            <span class="relative z-10 flex items-center justify-center gap-2">
                                <span class="text-xl">💾</span>
                                <span class="font-bold">Download Now</span>
                            </span>
                            <div class="btn-glow"></div>
                        </a>
                        ${result.datasetUrl ? `
                            <div class="mt-4">
                                <a href="${result.datasetUrl}" target="_blank" class="text-sm text-gray-400 hover:text-white transition">
                                    📊 View full data in Apify Console
                                </a>
                            </div>
                        ` : ''}
                    </div>
                `;

                // Confetti effect
                createConfetti();
                showSuccessToast('Video downloaded successfully!');

            } else if (result.requiresFormatSelection && result.availableFormats) {
                // Show format selection
                let formatsHTML = '';
                result.availableFormats.forEach((format, index) => {
                    const isAudio = format.type === 'audio';
                    const icon = format.icon || (isAudio ? '🎵' : '🎬');
                    const bgColor = isAudio ? 'from-purple-500 to-pink-600' : 'from-blue-500 to-green-600';

                    formatsHTML += `
                        <button onclick="downloadWithFormat('${result.originalUrl}', '${format.format}', '${platform}')" 
                                class="format-option bg-gradient-to-r ${bgColor} hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-between w-full">
                            <div class="flex items-center gap-3">
                                <span class="text-2xl">${icon}</span>
                                <div class="text-left">
                                    <div class="font-bold">${format.quality}</div>
                                    <div class="text-sm opacity-80">${format.description}</div>
                                </div>
                            </div>
                            <span class="text-xl">📥</span>
                        </button>
                    `;
                });

                resultDiv.innerHTML = `
                    <div class="success-card animate-scaleIn">
                        <div class="text-5xl mb-4 animate-bounce">🎬</div>
                        <h3 class="text-2xl font-bold text-white mb-4">Choose Format & Quality</h3>
                        ${videoInfoHTML}
                        <div class="mt-6">
                            <h4 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span>📊</span>
                                <span>Available Formats</span>
                            </h4>
                            <div class="space-y-3">
                                ${formatsHTML}
                            </div>
                        </div>
                        ${result.note ? `
                            <div class="mt-4 bg-blue-600 bg-opacity-20 border border-blue-500 rounded-lg p-3">
                                <p class="text-blue-200 text-sm">
                                    <span class="font-bold">ℹ️ Info:</span> ${result.note}
                                </p>
                            </div>
                        ` : ''}
                    </div>
                `;

                showSuccessToast('Select your preferred format to download!');

            } else {
                // Fallback mode - show alternatives
                console.log('🔍 Debug - Full result:', result);
                console.log('🔍 Debug - Alternatives:', result.alternatives);

                let alternativesHTML = '';

                if (result.alternatives && result.alternatives.length > 0) {
                    alternativesHTML = `
                        <div class="alternatives mt-6">
                            <h4 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span>🛠️</span>
                                <span>Download Options</span>
                            </h4>
                            <div class="space-y-4">
                    `;

                    result.alternatives.forEach((alt, index) => {
                        if (alt.method === 'yt-dlp') {
                            alternativesHTML += `
                                <div class="alternative-option bg-white bg-opacity-5 rounded-lg p-4">
                                    <h5 class="font-bold text-yellow-400 mb-2">⚡ ${alt.method}</h5>
                                    <p class="text-gray-300 text-sm mb-3">${alt.description}</p>
                                    <div class="bg-black bg-opacity-50 rounded p-3 font-mono text-sm text-green-400">
                                        ${alt.command}
                                    </div>
                                    <button onclick="navigator.clipboard.writeText('${alt.command}')" 
                                            class="mt-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition">
                                        Copy Command
                                    </button>
                                </div>
                            `;
                        } else if (alt.method === 'Browser Extensions') {
                            alternativesHTML += `
                                <div class="alternative-option bg-white bg-opacity-5 rounded-lg p-4">
                                    <h5 class="font-bold text-blue-400 mb-2">🔌 ${alt.method}</h5>
                                    <p class="text-gray-300 text-sm mb-3">${alt.description}</p>
                                    <div class="grid grid-cols-1 gap-2">
                                        ${alt.options.map(option => `
                                            <div class="text-sm text-gray-300">• ${option}</div>
                                        `).join('')}
                                    </div>
                                </div>
                            `;
                        } else if (alt.method === 'Online Services') {
                            alternativesHTML += `
                                <div class="alternative-option bg-white bg-opacity-5 rounded-lg p-4">
                                    <h5 class="font-bold text-green-400 mb-2">🌐 ${alt.method}</h5>
                                    <p class="text-gray-300 text-sm mb-3">${alt.description}</p>
                                    <div class="grid grid-cols-1 gap-2">
                                        ${alt.services.map(service => `
                                            <a href="${service.url}" target="_blank" 
                                               class="flex items-center justify-between bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition">
                                                <span>${service.name}</span>
                                                <span>🔗</span>
                                            </a>
                                        `).join('')}
                                    </div>
                                </div>
                            `;
                        }
                    });

                    alternativesHTML += `
                            </div>
                        </div>
                    `;
                } else {
                    // Fallback alternatives if none provided
                    alternativesHTML = `
                        <div class="alternatives mt-6">
                            <h4 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span>🛠️</span>
                                <span>Download Options</span>
                            </h4>
                            <div class="space-y-4">
                                <div class="alternative-option bg-white bg-opacity-5 rounded-lg p-4">
                                    <h5 class="font-bold text-yellow-400 mb-2">⚡ yt-dlp (Recommended)</h5>
                                    <p class="text-gray-300 text-sm mb-3">Most reliable command line tool</p>
                                    <div class="bg-black bg-opacity-50 rounded p-3 font-mono text-sm text-green-400">
                                        yt-dlp "${result.originalUrl || url}"
                                    </div>
                                    <button onclick="navigator.clipboard.writeText('yt-dlp \\"${result.originalUrl || url}\\"')" 
                                            class="mt-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition">
                                        Copy Command
                                    </button>
                                </div>
                                
                                <div class="alternative-option bg-white bg-opacity-5 rounded-lg p-4">
                                    <h5 class="font-bold text-blue-400 mb-2">🔌 Browser Extensions</h5>
                                    <p class="text-gray-300 text-sm mb-3">Install browser extension for easy downloading</p>
                                    <div class="grid grid-cols-1 gap-2">
                                        <div class="text-sm text-gray-300">• Video DownloadHelper</div>
                                        <div class="text-sm text-gray-300">• SaveFrom.net Helper</div>
                                        <div class="text-sm text-gray-300">• 4K Video Downloader</div>
                                    </div>
                                </div>
                                
                                <div class="alternative-option bg-white bg-opacity-5 rounded-lg p-4">
                                    <h5 class="font-bold text-green-400 mb-2">🌐 Online Services</h5>
                                    <p class="text-gray-300 text-sm mb-3">Use online services to download</p>
                                    <div class="grid grid-cols-1 gap-2">
                                        <a href="https://www.y2mate.com/youtube" target="_blank" 
                                           class="flex items-center justify-between bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition">
                                            <span>y2mate.com</span>
                                            <span>🔗</span>
                                        </a>
                                        <a href="https://savefrom.net/#url=${encodeURIComponent(result.originalUrl || url)}" target="_blank" 
                                           class="flex items-center justify-between bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition">
                                            <span>savefrom.net</span>
                                            <span>🔗</span>
                                        </a>
                                        <a href="https://keepvid.com" target="_blank" 
                                           class="flex items-center justify-between bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition">
                                            <span>keepvid.com</span>
                                            <span>🔗</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }

                resultDiv.innerHTML = `
                    <div class="success-card animate-scaleIn">
                        <div class="text-4xl mb-4 animate-bounce">📹</div>
                        <h3 class="text-2xl font-bold text-white mb-4">Video Found!</h3>
                        ${videoInfoHTML}
                        ${result.note ? `
                            <div class="bg-yellow-600 bg-opacity-20 border border-yellow-500 rounded-lg p-3 mb-4">
                                <p class="text-yellow-200 text-sm">
                                    <span class="font-bold">ℹ️ Note:</span> ${result.note}
                                </p>
                            </div>
                        ` : ''}
                        ${alternativesHTML}
                    </div>
                `;

                showSuccessToast('Video found! Choose your download method below.');
            }
        } else {
            // Handle specific error types from backend
            showErrorAlert('DOWNLOAD_FAILED', result.message || 'Failed to download video');
        }
    } catch (error) {
        loadingDiv.classList.add('hidden');
        form.classList.remove('form-loading');

        // Network or connection error
        showErrorAlert('NETWORK_ERROR', error.message);
    }
});

// Download with selected format
async function downloadWithFormat(url, formatId, platform) {
    const resultDiv = document.getElementById('result');

    // Show loading state
    resultDiv.innerHTML = `
        <div class="loading-card animate-scaleIn">
            <div class="text-4xl mb-4 animate-spin">⚙️</div>
            <h3 class="text-xl font-bold text-white mb-2">Processing Download...</h3>
            <p class="text-gray-300">Downloading video with selected quality...</p>
            <div class="loading-bar mt-4">
                <div class="loading-progress"></div>
            </div>
        </div>
    `;

    try {
        const response = await fetch('/download-format', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: url,
                format_id: formatId,
                platform: platform
            })
        });

        const result = await response.json();

        if (result.success && result.downloadUrl) {
            // Success - show download link
            const videoInfoHTML = result.videoInfo ? `
                <div class="video-info bg-white bg-opacity-10 rounded-lg p-4 mb-4">
                    <div class="flex items-center gap-4 mb-3">
                        <div class="text-4xl">🎬</div>
                        <div>
                            <h4 class="font-bold text-white text-lg">${result.videoInfo.title}</h4>
                            <p class="text-gray-300 text-sm">by ${result.videoInfo.author}</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 text-sm text-gray-300">
                        ${result.videoInfo.duration ? `<div>⏱️ ${formatDuration(result.videoInfo.duration)}</div>` : ''}
                        ${result.videoInfo.views ? `<div>👁️ ${formatNumber(result.videoInfo.views)} views</div>` : ''}
                        <div>📱 ${platform}</div>
                        <div>📊 Format: ${result.formatId}</div>
                    </div>
                </div>
            ` : '';

            resultDiv.innerHTML = `
                <div class="success-card animate-scaleIn">
                    <div class="text-5xl mb-4 animate-bounce">✅</div>
                    <h3 class="text-2xl font-bold text-white mb-4">Download Ready!</h3>
                    ${videoInfoHTML}
                    <a href="${result.downloadUrl}" download class="btn-success group">
                        <span class="relative z-10 flex items-center justify-center gap-2">
                            <span class="text-xl">💾</span>
                            <span class="font-bold">Download Now</span>
                        </span>
                        <div class="btn-glow"></div>
                    </a>
                    ${result.note ? `
                        <div class="mt-4 bg-green-600 bg-opacity-20 border border-green-500 rounded-lg p-3">
                            <p class="text-green-200 text-sm">
                                <span class="font-bold">ℹ️ Info:</span> ${result.note}
                            </p>
                        </div>
                    ` : ''}
                </div>
            `;

            // Confetti effect
            createConfetti();
            showSuccessToast('Video ready for download!');

        } else {
            // Error
            showErrorAlert('DOWNLOAD_FAILED', result.message || 'Failed to download with selected format');
        }

    } catch (error) {
        console.error('Format download error:', error);
        showErrorAlert('NETWORK_ERROR', 'Failed to process download request');
    }
}

// Error Alert System
function showErrorAlert(errorType, message) {
    const resultDiv = document.getElementById('result');

    let errorIcon = '❌';
    let errorTitle = 'Error';
    let errorDescription = message;
    let errorColor = 'red';
    let suggestions = [];

    // Determine error type and customize alert
    if (typeof errorType === 'number') {
        // HTTP Status Code errors
        switch (errorType) {
            case 400:
                errorIcon = '⚠️';
                errorTitle = 'Invalid Request';
                errorDescription = 'The URL or platform you provided is invalid';
                errorColor = 'yellow';
                suggestions = [
                    'Check if the URL is correct',
                    'Make sure you selected the right platform',
                    'Try copying the URL again'
                ];
                break;
            case 401:
                errorIcon = '🔒';
                errorTitle = 'Authentication Required';
                errorDescription = 'You need to be authenticated to download this video';
                errorColor = 'orange';
                suggestions = [
                    'Login to your account',
                    'Check your API credentials'
                ];
                break;
            case 403:
                errorIcon = '🚫';
                errorTitle = 'Access Denied';
                errorDescription = 'You don\'t have permission to download this video';
                errorColor = 'red';
                suggestions = [
                    'The video might be private',
                    'Check if the video is age-restricted',
                    'Try a different video'
                ];
                break;
            case 404:
                errorIcon = '🔍';
                errorTitle = 'Video Not Found';
                errorDescription = 'The video you\'re trying to download doesn\'t exist';
                errorColor = 'blue';
                suggestions = [
                    'Check if the URL is correct',
                    'The video might have been deleted',
                    'Try refreshing the page'
                ];
                break;
            case 429:
                errorIcon = '⏱️';
                errorTitle = 'Too Many Requests';
                errorDescription = 'You\'ve made too many download requests';
                errorColor = 'orange';
                suggestions = [
                    'Wait a few minutes before trying again',
                    'Reduce the number of simultaneous downloads'
                ];
                break;
            case 500:
                errorIcon = '🔧';
                errorTitle = 'Server Error';
                errorDescription = 'Our server encountered an error';
                errorColor = 'red';
                suggestions = [
                    'Try again in a few moments',
                    'Contact support if the problem persists'
                ];
                break;
            case 503:
                errorIcon = '🛠️';
                errorTitle = 'Service Unavailable';
                errorDescription = 'The service is temporarily unavailable';
                errorColor = 'orange';
                suggestions = [
                    'We might be doing maintenance',
                    'Try again in a few minutes'
                ];
                break;
            default:
                errorIcon = '❌';
                errorTitle = `Error ${errorType}`;
                errorDescription = message || 'An unexpected error occurred';
                errorColor = 'red';
        }
    } else {
        // Custom error types
        switch (errorType) {
            case 'NETWORK_ERROR':
                errorIcon = '📡';
                errorTitle = 'Network Error';
                errorDescription = 'Unable to connect to the server';
                errorColor = 'red';
                suggestions = [
                    'Check your internet connection',
                    'Try disabling VPN or proxy',
                    'Refresh the page and try again'
                ];
                break;
            case 'TIMEOUT':
                errorIcon = '⏰';
                errorTitle = 'Request Timeout';
                errorDescription = 'The request took too long to complete';
                errorColor = 'orange';
                suggestions = [
                    'The video might be too large',
                    'Try again with a better connection',
                    'Try a shorter video'
                ];
                break;
            case 'INVALID_URL':
                errorIcon = '🔗';
                errorTitle = 'Invalid URL';
                errorDescription = 'The URL format is not valid';
                errorColor = 'yellow';
                suggestions = [
                    'Make sure you copied the full URL',
                    'Check for any extra spaces',
                    'Try copying the URL again'
                ];
                break;
            case 'UNSUPPORTED_PLATFORM':
                errorIcon = '🚫';
                errorTitle = 'Platform Not Supported';
                errorDescription = 'This platform is not supported yet';
                errorColor = 'blue';
                suggestions = [
                    'Check the list of supported platforms',
                    'Request support for this platform'
                ];
                break;
            case 'DOWNLOAD_FAILED':
                errorIcon = '💔';
                errorTitle = 'Download Failed';
                errorDescription = message || 'Failed to download the video';
                errorColor = 'red';
                suggestions = [
                    'The video might be protected',
                    'Try a different quality setting',
                    'Check if the video is still available'
                ];
                break;
            case 'API_ERROR':
                errorIcon = '⚙️';
                errorTitle = 'API Error';
                errorDescription = message || 'The API returned an error';
                errorColor = 'red';
                suggestions = [
                    'The external API might be down',
                    'Try again in a few minutes',
                    'Contact support if this persists'
                ];
                break;
            default:
                errorIcon = '❌';
                errorTitle = 'Unknown Error';
                errorDescription = message || 'An unexpected error occurred';
                errorColor = 'red';
                suggestions = ['Try refreshing the page', 'Contact support if the problem persists'];
        }
    }

    // Build suggestions HTML
    const suggestionsHTML = suggestions.length > 0 ? `
        <div class="mt-4 text-left">
            <p class="text-white font-semibold mb-2 text-sm">💡 Suggestions:</p>
            <ul class="space-y-1">
                ${suggestions.map(s => `
                    <li class="text-gray-300 text-sm flex items-start gap-2">
                        <span class="text-${errorColor}-400 mt-0.5">•</span>
                        <span>${s}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
    ` : '';

    resultDiv.innerHTML = `
        <div class="error-card animate-shake" style="border-color: rgba(var(--${errorColor}-rgb), 0.3);">
            <div class="text-6xl mb-4 animate-bounce">${errorIcon}</div>
            <h3 class="text-2xl font-bold text-white mb-2">${errorTitle}</h3>
            <p class="text-${errorColor}-300 text-lg mb-2">${errorDescription}</p>
            <div class="error-code text-gray-500 text-sm mb-4">
                Error Code: ${typeof errorType === 'number' ? `HTTP ${errorType}` : errorType}
            </div>
            ${suggestionsHTML}
            <button onclick="document.getElementById('result').innerHTML = ''" 
                    class="mt-6 px-6 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-lg transition-all duration-300 hover:scale-105">
                Dismiss
            </button>
        </div>
    `;

    // Show toast notification
    showToast(errorTitle, errorIcon, errorColor);
}

// Toast Notification System
function showToast(message, icon = '✅', type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slideInRight`;
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <span class="text-3xl">${icon}</span>
            <span class="font-semibold">${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.classList.add('animate-slideOutRight');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function showSuccessToast(message) {
    showToast(message, '✅', 'success');
}

// Confetti animation
function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 5000);
    }
}

// Input focus animations
const inputs = document.querySelectorAll('.input-field');
inputs.forEach(input => {
    input.addEventListener('focus', function () {
        this.parentElement.classList.add('input-focused');
    });

    input.addEventListener('blur', function () {
        this.parentElement.classList.remove('input-focused');
    });
});

// Parallax effect for floating shapes
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    const shapes = document.querySelectorAll('.floating-shape');
    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 10;
        const x = mouseX * speed;
        const y = mouseY * speed;
        shape.style.transform = `translate(${x}px, ${y}px) rotate(${mouseX * 360}deg)`;
    });

    const particles = document.querySelectorAll('.particle');
    particles.forEach((particle, index) => {
        const speed = (index + 1) * 0.3;
        const x = mouseX * speed * 30;
        const y = mouseY * speed * 30;
        particle.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// Button ripple effect
const buttons = document.querySelectorAll('button, .btn-success');
buttons.forEach(button => {
    button.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// Scroll reveal animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card').forEach(card => {
    observer.observe(card);
});

// Platform select animation
const platformSelect = document.getElementById('platform');
platformSelect.addEventListener('change', function () {
    this.classList.add('select-changed');
    setTimeout(() => {
        this.classList.remove('select-changed');
    }, 300);
});

// Helper functions
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

console.log('✨ All animations initialized!');
// Download with specific format
async function downloadWithFormat(url, format, platform) {
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');

    // Show loading animation
    loadingDiv.classList.remove('hidden');
    resultDiv.innerHTML = '';

    try {
        const response = await fetch('/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url, platform, format })
        });

        // Hide loading
        loadingDiv.classList.add('hidden');

        // Handle different HTTP status codes
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            showErrorAlert(response.status, errorData.message || 'Unknown error occurred');
            return;
        }

        const result = await response.json();

        if (result.success && result.downloadUrl) {
            // Build video info HTML if available
            let videoInfoHTML = '';
            if (result.videoInfo) {
                const info = result.videoInfo;
                videoInfoHTML = `
                    <div class="video-info mb-6 text-left bg-white bg-opacity-5 rounded-lg p-4">
                        ${info.thumbnail ? `<img src="${info.thumbnail}" alt="Thumbnail" class="w-full rounded-lg mb-3">` : ''}
                        ${info.title ? `<h4 class="text-lg font-bold text-white mb-2">📹 ${info.title}</h4>` : ''}
                        <div class="grid grid-cols-2 gap-2 text-sm text-gray-300">
                            ${info.duration ? `<div>⏱️ ${info.duration}</div>` : ''}
                            ${info.quality ? `<div>🎬 ${info.quality}</div>` : ''}
                            ${info.type ? `<div>📱 ${info.type}</div>` : ''}
                            <div>🌐 ${result.method}</div>
                        </div>
                    </div>
                `;
            }

            // Direct download available
            resultDiv.innerHTML = `
                <div class="success-card animate-scaleIn">
                    <div class="text-5xl mb-4 animate-bounce">${result.videoInfo?.type === 'audio' ? '🎵' : '✅'}</div>
                    <h3 class="text-2xl font-bold text-white mb-4">${result.videoInfo?.type === 'audio' ? 'Audio Ready!' : 'Video Ready!'}</h3>
                    ${videoInfoHTML}
                    <a href="${result.downloadUrl}" download class="btn-success group">
                        <span class="relative z-10 flex items-center justify-center gap-2">
                            <span class="text-xl">${result.videoInfo?.type === 'audio' ? '🎵' : '💾'}</span>
                            <span class="font-bold">Download ${result.selectedFormat ? `(${result.selectedFormat})` : 'Now'}</span>
                        </span>
                        <div class="btn-glow"></div>
                    </a>
                    ${result.responseTime ? `
                        <div class="mt-4 text-sm text-gray-400">
                            ⚡ Generated in ${result.responseTime}
                        </div>
                    ` : ''}
                </div>
            `;

            // Confetti effect
            createConfetti();
            showSuccessToast(`${result.videoInfo?.type === 'audio' ? 'Audio' : 'Video'} ready for download!`);

        } else {
            showErrorAlert('DOWNLOAD_FAILED', result.message || 'Failed to generate download link');
        }

    } catch (error) {
        // Hide loading
        loadingDiv.classList.add('hidden');

        console.error('Download error:', error);

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showErrorAlert('NETWORK_ERROR', 'Unable to connect to the server');
        } else {
            showErrorAlert('DOWNLOAD_FAILED', error.message || 'An unexpected error occurred');
        }
    }
}