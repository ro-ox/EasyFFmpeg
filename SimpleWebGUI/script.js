// Switch Tab Function
function switchTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Disable all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Activate the selected tab and button
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

// Refresh range adjust
document.getElementById('brightness').oninput = function() {
    document.getElementById('brightnessValue').textContent = this.value;
}
document.getElementById('contrast').oninput = function() {
    document.getElementById('contrastValue').textContent = this.value;
}
document.getElementById('volume').oninput = function() {
    document.getElementById('volumeValue').textContent = this.value;
}
document.getElementById('crf').oninput = function() {
    document.getElementById('crfValue').textContent = this.value;
}

// Set Presets
function setPreset(type) {
    // Active deletion of all presets
    document.querySelectorAll('.preset-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    if (type === 'high') {
        document.getElementById('crf').value = 18;
        document.getElementById('crfValue').textContent = '18';
        document.getElementById('preset').value = 'slow';
    } else if (type === 'medium') {
        document.getElementById('crf').value = 23;
        document.getElementById('crfValue').textContent = '23';
        document.getElementById('preset').value = 'medium';
    } else if (type === 'low') {
        document.getElementById('crf').value = 28;
        document.getElementById('crfValue').textContent = '28';
        document.getElementById('preset').value = 'fast';
    } else if (type === 'fast') {
        document.getElementById('crf').value = 23;
        document.getElementById('crfValue').textContent = '23';
        document.getElementById('preset').value = 'ultrafast';
    }
}

// Set Compression
function setCompression(level) {
    document.querySelectorAll('.preset-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    if (level === 'light') {
        document.getElementById('crf').value = 20;
        document.getElementById('crfValue').textContent = '20';
    } else if (level === 'medium') {
        document.getElementById('crf').value = 25;
        document.getElementById('crfValue').textContent = '25';
    } else if (level === 'high') {
        document.getElementById('crf').value = 30;
        document.getElementById('crfValue').textContent = '30';
    } else if (level === 'extreme') {
        document.getElementById('crf').value = 35;
        document.getElementById('crfValue').textContent = '35';
    }
}

// set Extraction
let extractionType = '';
function setExtraction(type) {
    document.querySelectorAll('.preset-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    extractionType = type;
}

// Generate FFmpeg Command
function generateCommand() {
    let command = 'ffmpeg';
    let inputFile = document.getElementById('inputFile').files[0];
    let inputPath = inputFile ? inputFile.name : 'input.mp4';

    // Input File
    command += ` -i "${inputPath}"`;

    // General Settings
    let overwrite = document.getElementById('overwrite').checked;
    if (overwrite) {
        command += ' -y';
    }

    let verbose = document.getElementById('verbose').checked;
    if (!verbose) {
        command += ' -loglevel error';
    }

    let threads = document.getElementById('threads').value;
    if (threads && threads !== '0') {
        command += ` -threads ${threads}`;
    }

    // Active Tab Now
    let activeTab = document.querySelector('.tab-content.active').id;

    if (activeTab === 'convert') {
        // Convert Format
        let outputFormat = document.getElementById('outputFormat').value;
        let outputName = document.getElementById('outputName').value || 'output';

        command += ` "${outputName}.${outputFormat}"`;

    } else if (activeTab === 'video') {
        // Edit Video
        let filters = [];

        // Set Resolution
        let resolution = document.getElementById('resolution').value;
        if (resolution) {
            filters.push(`scale=${resolution}`);
        }

        // Set Frame Rate
        let fps = document.getElementById('fps').value;
        if (fps) {
            command += ` -r ${fps}`;
        }

        // Start time and duration
        let startTime = document.getElementById('startTime').value;
        if (startTime) {
            command += ` -ss ${startTime}`;
        }

        let duration = document.getElementById('duration').value;
        if (duration) {
            command += ` -t ${duration}`;
        }

        // Video Filters
        if (document.getElementById('deinterlace').checked) {
            filters.push('yadif');
        }

        if (document.getElementById('denoise').checked) {
            filters.push('hqdn3d');
        }

        if (document.getElementById('sharpen').checked) {
            filters.push('unsharp=5:5:1.0:5:5:0.0');
        }

        if (document.getElementById('flipH').checked) {
            filters.push('hflip');
        }

        if (document.getElementById('flipV').checked) {
            filters.push('vflip');
        }

        // Brightness & Contrast
        let brightness = document.getElementById('brightness').value;
        let contrast = document.getElementById('contrast').value;

        if (brightness !== 0 || contrast !== 1) {
            filters.push(`eq=brightness=${brightness}:contrast=${contrast}`);
        }

        // Apply Filter
        if (filters.length > 0) {
            command += ` -vf "${filters.join(',')}"`;
        }

        let outputFormat = document.getElementById('outputFormat').value || 'mp4';
        command += ` output.${outputFormat}`;

    } else if (activeTab === 'audio') {
        // Audio Edit
        let audioBitrate = document.getElementById('audioBitrate').value;
        if (audioBitrate) {
            command += ` -ab ${audioBitrate}`;
        }

        let sampleRate = document.getElementById('sampleRate').value;
        if (sampleRate) {
            command += ` -ar ${sampleRate}`;
        }

        let channels = document.getElementById('channels').value;
        if (channels) {
            command += ` -ac ${channels}`;
        }

        let volume = document.getElementById('volume').value;
        if (volume !== 1) {
            command += ` -af "volume=${volume}"`;
        }

        // Audio Filters
        let audioFilters = [];
        if (document.getElementById('audioNormalize').checked) {
            audioFilters.push('loudnorm');
        }

        if (document.getElementById('audioNoise').checked) {
            audioFilters.push('afftdn');
        }

        if (audioFilters.length > 0) {
            if (volume !== 1) {
                command = command.replace(`-af "volume=${volume}"`, `-af "volume=${volume},${audioFilters.join(',')}"`);
            } else {
                command += ` -af "${audioFilters.join(',')}"`;
            }
        }

        let outputFormat = document.getElementById('outputFormat').value || 'mp3';
        command += ` output.${outputFormat}`;

    } else if (activeTab === 'compress') {
        // Compression
        let crf = document.getElementById('crf').value;
        let preset = document.getElementById('preset').value;

        command += ` -crf ${crf} -preset ${preset}`;

        let outputFormat = document.getElementById('outputFormat').value || 'mp4';
        command += ` compressed_output.${outputFormat}`;

    } else if (activeTab === 'extract') {
        // Extraction
        if (extractionType === 'audio') {
            command += ' -vn';
            let audioBitrate = document.getElementById('audioBitrate').value || '192k';
            command += ` -ab ${audioBitrate} extracted_audio.mp3`;

        } else if (extractionType === 'frames') {
            let frameInterval = document.getElementById('frameInterval').value || 1;
            let imageFormat = document.getElementById('imageFormat').value || 'png';
            command += ` -vf "fps=1/${frameInterval}" frame_%04d.${imageFormat}`;

        } else if (extractionType === 'subtitle') {
            command += ' -map 0:s:0 -c:s srt subtitles.srt';

        } else if (extractionType === 'thumbnail') {
            command += ' -ss 00:00:10 -vframes 1 thumbnail.jpg';
        }

    } else if (activeTab === 'advanced') {
        // Advanced Setting
        let videoCodec = document.getElementById('videoCodec').value;
        if (videoCodec) {
            command += ` -c:v ${videoCodec}`;
        }

        let audioCodec = document.getElementById('audioCodec').value;
        if (audioCodec) {
            command += ` -c:a ${audioCodec}`;
        }

        let extraParams = document.getElementById('extraParams').value;
        if (extraParams) {
            command += ` ${extraParams}`;
        }

        let outputFormat = document.getElementById('outputFormat').value || 'mp4';
        command += ` advanced_output.${outputFormat}`;
    }

    // Show command
    document.getElementById('commandText').textContent = command;
}

// Copy Command
function copyCommand() {
    let commandText = document.getElementById('commandText').textContent;
    navigator.clipboard.writeText(commandText).then(() => {
        let copyBtn = document.querySelector('.copy-button');
        let originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        copyBtn.style.background = '#28a745';

        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '#007bff';
        }, 2000);
    });
}

// Display the name of the selected file.
document.getElementById('inputFile').addEventListener('change', function(e) {
    document.querySelector('.file-input-label span:last-child').textContent = e.target.files[0] ? e.target.files[0].name : 'Select input file';
});

// Generate the initial command
generateCommand();
