const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

// Middleware
app.use(bodyParser.json());

// CORS middleware for Netlify
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Main download endpoint
app.post('/download', async (req, res) => {
    const { url, platform, format, quality } = req.body;

    // Validate input
    if (!url || !platform) {
        return res.status(400).json({
            success: false,
            message: 'URL and platform are required'
        });
    }

    // Validate URL format
    try {
        new URL(url);
    } catch (e) {
        return res.status(400).json({
            success: false,
            message: 'Invalid URL format'
        });
    }

    // Validate platform
    const supportedPlatforms = ['youtube', 'tiktok', 'instagram', 'facebook', 'rednote'];
    if (!supportedPlatforms.includes(platform)) {
        return res.status(400).json({
            success: false,
            message: 'Unsupported platform'
        });
    }

    console.log(`[${new Date().toISOString()}] Download request: ${platform} - ${url}${format ? ` (${format})` : ''}`);

    try {
        // Handle YouTube with NekoLabs API
        if (platform === 'youtube') {
            // If no format specified, return available formats for user selection
            if (!format && !quality) {
                console.log(`[${new Date().toISOString()}] 🎬 Getting available formats for user selection`);

                try {
                    // Get video info first with default format to get basic details
                    const infoUrl = `https://api.nekolabs.web.id/downloader/youtube/v1?url=${encodeURIComponent(url)}&format=480`;
                    const infoResponse = await axios.get(infoUrl, {
                        timeout: 15000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    if (infoResponse.data && infoResponse.data.success && infoResponse.data.result) {
                        const result = infoResponse.data.result;

                        console.log(`[${new Date().toISOString()}] ✅ Got video info for format selection`);

                        return res.json({
                            success: true,
                            requiresFormatSelection: true,
                            platform: platform,
                            originalUrl: url,
                            videoInfo: {
                                title: result.title,
                                duration: result.duration,
                                thumbnail: result.cover,
                                type: result.type
                            },
                            availableFormats: [
                                {
                                    format: 'mp3',
                                    quality: '128kbps',
                                    type: 'audio',
                                    description: 'MP3 Audio (128kbps)',
                                    fileType: 'mp3',
                                    icon: '🎵'
                                },
                                {
                                    format: '144',
                                    quality: '144p',
                                    type: 'video',
                                    description: 'MP4 Video (144p - Low)',
                                    fileType: 'mp4',
                                    icon: '📱'
                                },
                                {
                                    format: '240',
                                    quality: '240p',
                                    type: 'video',
                                    description: 'MP4 Video (240p - Low)',
                                    fileType: 'mp4',
                                    icon: '📱'
                                },
                                {
                                    format: '360',
                                    quality: '360p',
                                    type: 'video',
                                    description: 'MP4 Video (360p - Medium)',
                                    fileType: 'mp4',
                                    icon: '💻'
                                },
                                {
                                    format: '480',
                                    quality: '480p',
                                    type: 'video',
                                    description: 'MP4 Video (480p - Medium)',
                                    fileType: 'mp4',
                                    icon: '💻'
                                },
                                {
                                    format: '720',
                                    quality: '720p',
                                    type: 'video',
                                    description: 'MP4 Video (720p - HD)',
                                    fileType: 'mp4',
                                    icon: '🖥️'
                                },
                                {
                                    format: '1080',
                                    quality: '1080p',
                                    type: 'video',
                                    description: 'MP4 Video (1080p - Full HD)',
                                    fileType: 'mp4',
                                    icon: '🖥️'
                                }
                            ],
                            note: 'Select your preferred format and quality:'
                        });
                    } else {
                        throw new Error('Could not get video information');
                    }
                } catch (infoError) {
                    console.error(`[${new Date().toISOString()}] ❌ Failed to get video info:`, infoError.message);
                    // Continue to fallback methods
                }
            } else {
                // User has selected a format, proceed with download
                const selectedFormat = format || quality || '480';
                console.log(`[${new Date().toISOString()}] 🚀 Using NekoLabs API for YouTube download (${selectedFormat})`);

                try {
                    // Call NekoLabs YouTube API with selected format
                    const apiUrl = `https://api.nekolabs.web.id/downloader/youtube/v1?url=${encodeURIComponent(url)}&format=${selectedFormat}`;

                    console.log(`[${new Date().toISOString()}] 📤 Calling NekoLabs API: ${apiUrl}`);

                    const response = await axios.get(apiUrl, {
                        timeout: 30000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    console.log(`[${new Date().toISOString()}] 📥 NekoLabs API response received`);

                    if (response.data && response.data.success && response.data.result) {
                        const result = response.data.result;

                        console.log(`[${new Date().toISOString()}] ✅ YouTube download successful via NekoLabs`);
                        console.log(`[${new Date().toISOString()}] 📄 Video: ${result.title}`);
                        console.log(`[${new Date().toISOString()}] 🎬 Quality: ${result.quality}`);
                        console.log(`[${new Date().toISOString()}] ⏱️ Duration: ${result.duration}`);

                        return res.json({
                            success: true,
                            downloadUrl: result.downloadUrl,
                            platform: platform,
                            originalUrl: url,
                            selectedFormat: selectedFormat,
                            videoInfo: {
                                title: result.title,
                                duration: result.duration,
                                thumbnail: result.cover,
                                quality: result.quality,
                                format: result.format,
                                type: result.type
                            },
                            method: 'NekoLabs API',
                            responseTime: response.data.responseTime,
                            note: `${result.type === 'audio' ? 'Audio' : 'Video'} ready for download via NekoLabs API`
                        });
                    } else {
                        console.error(`[${new Date().toISOString()}] ❌ Invalid NekoLabs API response:`, response.data);
                        throw new Error('Invalid response from NekoLabs API');
                    }

                } catch (apiError) {
                    console.error(`[${new Date().toISOString()}] ❌ NekoLabs API failed:`, apiError.message);
                    // Continue to fallback methods
                }
            }

            // Simple fallback for YouTube
            console.log(`[${new Date().toISOString()}] 🔄 Using simple fallback...`);

            return res.status(503).json({
                success: false,
                message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} download service is temporarily unavailable. Please try again later.`,
                platform: platform,
                originalUrl: url,
                note: "Service temporarily unavailable",
                suggestion: "Please try again in a few minutes or use alternative download methods."
            });
        }

        // Handle TikTok, Instagram, Facebook, and RedNote with NekoLabs AIO API
        if (['tiktok', 'instagram', 'facebook', 'rednote'].includes(platform)) {
            console.log(`[${new Date().toISOString()}] 🚀 Using AIO API for ${platform} download`);

            try {
                // Call NekoLabs AIO API
                const apiUrl = `https://api.nekolabs.web.id/downloader/aio/v1?url=${encodeURIComponent(url)}`;

                console.log(`[${new Date().toISOString()}] 📤 Calling AIO API: ${apiUrl}`);

                const response = await axios.get(apiUrl, {
                    timeout: 30000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                console.log(`[${new Date().toISOString()}] 📥 AIO API response received`);

                if (response.data && response.data.success && response.data.result) {
                    const result = response.data.result;

                    console.log(`[${new Date().toISOString()}] ✅ ${platform} download successful via NekoLabs AIO`);
                    console.log(`[${new Date().toISOString()}] 📄 Content: ${result.title || result.caption || 'Unknown'}`);

                    // Handle different result structures
                    let downloadUrl = null;
                    let videoInfo = {};

                    if (result.medias && result.medias.length > 0) {
                        // Multiple media files (Instagram carousel, RedNote, etc.)
                        const media = result.medias[0]; // Get first media
                        downloadUrl = media.url;
                        videoInfo = {
                            title: result.title || result.caption || 'Social Media Content',
                            thumbnail: result.thumbnail || media.thumbnail,
                            author: result.author || result.username || 'Unknown',
                            type: media.type || 'video',
                            quality: media.quality || media.extension || 'original',
                            duration: result.duration || 'Unknown'
                        };

                        console.log(`[${new Date().toISOString()}] 📱 Media found: ${media.type} (${media.quality || media.extension})`);
                        console.log(`[${new Date().toISOString()}] 🔗 Download URL: ${downloadUrl.substring(0, 50)}...`);
                    } else if (result.url) {
                        // Single media file
                        downloadUrl = result.url;
                        videoInfo = {
                            title: result.title || result.caption || 'Social Media Content',
                            thumbnail: result.thumbnail,
                            author: result.author || result.username || 'Unknown',
                            type: result.type || 'video',
                            quality: result.quality || 'original'
                        };
                    } else if (result.video_url) {
                        // TikTok specific structure
                        downloadUrl = result.video_url;
                        videoInfo = {
                            title: result.title || result.desc || 'TikTok Video',
                            thumbnail: result.cover || result.thumbnail,
                            author: result.author || result.username || 'Unknown',
                            type: 'video',
                            quality: 'original'
                        };
                    }

                    if (downloadUrl) {
                        return res.json({
                            success: true,
                            downloadUrl: downloadUrl,
                            platform: platform,
                            originalUrl: url,
                            videoInfo: videoInfo,
                            method: 'NekoLabs AIO API',
                            responseTime: response.data.responseTime,
                            note: `${platform.charAt(0).toUpperCase() + platform.slice(1)} content ready for download`
                        });
                    } else {
                        console.error(`[${new Date().toISOString()}] ❌ No download URL found in AIO response`);
                        throw new Error('No download URL available in the response');
                    }

                } else {
                    console.error(`[${new Date().toISOString()}] ❌ Invalid AIO API response:`, response.data);
                    throw new Error('Invalid response from AIO API');
                }

            } catch (apiError) {
                console.error(`[${new Date().toISOString()}] ❌ AIO API failed:`, apiError.message);

                // Simple fallback for all AIO platforms
                return res.status(503).json({
                    success: false,
                    message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} download service is temporarily unavailable. Please try again later.`,
                    platform: platform,
                    originalUrl: url,
                    note: "Service temporarily unavailable",
                    suggestion: "Please try again in a few minutes or use alternative download methods."
                });
            }
        }

        // Unsupported platform
        return res.status(501).json({
            success: false,
            message: `${platform} downloads are not yet implemented.`
        });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Download error:`, error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error occurred'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            'nekolabs-youtube': 'active',
            'nekolabs-aio': 'active'
        },
        supportedPlatforms: ['youtube', 'tiktok', 'instagram', 'facebook', 'rednote']
    });
});

// API info endpoint
app.get('/api/info', (req, res) => {
    res.json({
        version: '1.0.0',
        supportedPlatforms: [
            { name: 'youtube', status: 'active', provider: 'NekoLabs YouTube API + fallback' },
            { name: 'tiktok', status: 'active', provider: 'NekoLabs AIO API' },
            { name: 'instagram', status: 'active', provider: 'NekoLabs AIO API' },
            { name: 'facebook', status: 'active', provider: 'NekoLabs AIO API' },
            { name: 'rednote', status: 'active', provider: 'NekoLabs AIO API' }
        ],
        supportedFormats: {
            youtube: [
                { format: 'mp3', description: 'MP3 Audio (128kbps)' },
                { format: '144', description: 'MP4 Video (144p)' },
                { format: '240', description: 'MP4 Video (240p)' },
                { format: '360', description: 'MP4 Video (360p)' },
                { format: '480', description: 'MP4 Video (480p)' },
                { format: '720', description: 'MP4 Video (720p)' },
                { format: '1080', description: 'MP4 Video (1080p)' }
            ]
        },
        endpoints: {
            download: 'POST /download',
            health: 'GET /health',
            info: 'GET /api/info'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Export for Netlify Functions
module.exports.handler = serverless(app);