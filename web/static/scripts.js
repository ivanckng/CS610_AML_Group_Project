// ============ Modern Sneaker Recognition JavaScript ============

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const imageUpload = document.getElementById('imageUpload');
    const uploadArea = document.getElementById('uploadArea');
    const progressArea = document.getElementById('progressArea');
    const sectionTitle = document.getElementById('sectionTitle');
    const titleText = document.getElementById('titleText');
    const browseLink = document.getElementById('browseLink');
    const previewArea = document.getElementById('previewArea');
    const actionButton = document.getElementById('actionButton');
    const resetButton = document.getElementById('resetButton');
    const shoeCanvas = document.getElementById('shoeCanvas');
    const ctx = shoeCanvas.getContext('2d');
    const loader = document.getElementById('loader');
    const loaderText = document.getElementById('loaderText');
    const errorOverlay = document.getElementById('errorOverlay');
    const errorMessage = document.getElementById('errorMessage');
    const recognitionResultDiv = document.getElementById('recognitionResult');
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    let uploadedImage = null;
    let isProcessing = false;

    // ============ Utility Functions ============
    
    function switchToProgressMode() {
        // Hide upload area, show progress area
        uploadArea.style.display = 'none';
        progressArea.style.display = 'flex';
        
        // Change title
        titleText.innerHTML = 'Identification Progress';
        
        // Show reset button
        resetButton.style.display = 'inline-flex';
        
        // Initialize Canvas to display uploaded image
        if (uploadedImage) {
            // Set canvas dimensions
            const maxWidth = 600;
            const maxHeight = 400;
            const aspectRatio = uploadedImage.width / uploadedImage.height;
            
            if (aspectRatio > maxWidth / maxHeight) {
                shoeCanvas.width = maxWidth;
                shoeCanvas.height = maxWidth / aspectRatio;
            } else {
                shoeCanvas.height = maxHeight;
                shoeCanvas.width = maxHeight * aspectRatio;
            }
            
            // Draw image to canvas
            ctx.clearRect(0, 0, shoeCanvas.width, shoeCanvas.height);
            ctx.drawImage(uploadedImage, 0, 0, shoeCanvas.width, shoeCanvas.height);
        }
    }
    
    function switchToUploadMode() {
        // Show upload area, hide progress area
        uploadArea.style.display = 'block';
        progressArea.style.display = 'none';
        
        // Restore title
        titleText.innerHTML = 'Upload Your Sneaker Image';
        
        // Hide reset button
        resetButton.style.display = 'none';
    }
    
    function showLoader(text = "AI Analysing...") {
        loader.style.display = 'flex';
        loaderText.textContent = text;
        errorOverlay.style.display = 'none';
        progressContainer.style.display = 'none';
    }

    function hideLoader() {
        loader.style.display = 'none';
    }

    function showProgress(percentage, text = "Identifying...") {
        // Ensure progress area is visible
        if (progressArea.style.display === 'none') {
            progressArea.style.display = 'flex';
        }
        
        progressContainer.style.display = 'block';
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = text;
        hideLoader();
    }

    function hideProgress() {
        progressContainer.style.display = 'none';
    }

    function showError(message) {
        errorOverlay.style.display = 'flex';
        errorMessage.textContent = message;
        hideLoader();
        hideProgress();
    }

    function hideError() {
        errorOverlay.style.display = 'none';
    }

    function resetUI() {
        uploadedImage = null;
        isProcessing = false;
        
        // Switch back to upload mode
        switchToUploadMode();
        
        // Reset Canvas
        ctx.clearRect(0, 0, shoeCanvas.width, shoeCanvas.height);
        shoeCanvas.width = 0;
        shoeCanvas.height = 0;
        
        // Reset preview area
        previewArea.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-image"></i>
                <p>Pending Image Uploaded</p>
            </div>
        `;
        
        // Reset result area
        recognitionResultDiv.innerHTML = `
            <div class="result-placeholder">
                <i class="fas fa-upload"></i>
                <p>Upload Image First</p>
            </div>
        `;
        
        // Reset button state
        actionButton.disabled = true;
        actionButton.innerHTML = '<i class="fas fa-magic"></i> Start to Identify';
        
        // Reset upload area
        uploadArea.style.pointerEvents = 'auto';
        uploadArea.classList.remove('highlight');
        
        // Hide loading and error states
        hideLoader();
        hideError();
        hideProgress();
        
        // Clear file input
        imageUpload.value = '';
    }

    function displaySuccessMessage(message, duration = 3000) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-toast';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Add success toast styles
        successDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(successDiv);
        
        // Animate in
        setTimeout(() => {
            successDiv.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto hide
        setTimeout(() => {
            successDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(successDiv);
            }, 300);
        }, duration);
    }

    function animateButton(button, text, icon = '') {
        const originalText = button.innerHTML;
        button.innerHTML = `<i class="${icon}"></i> ${text}`;
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 2000);
    }

    // ============ Event Handlers ============
    
    // 上传图片后，按钮变为"Start to Identify"
    function setToIdentify() {
        actionButton.disabled = false;
        actionButton.innerHTML = '<i class="fas fa-magic"></i> Start to Identify';
    }

    // 识别完成后，按钮变为"Re-Analyse"
    function setToReanalyse() {
        actionButton.disabled = false;
        actionButton.innerHTML = '<i class="fas fa-redo"></i> Re-Analyse';
    }

    // File upload handlers
    browseLink.addEventListener('click', (e) => {
        e.preventDefault();
        imageUpload.click();
    });

    uploadArea.addEventListener('click', () => {
        if (!isProcessing) {
            imageUpload.click();
        }
    });

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!isProcessing) {
            uploadArea.classList.add('highlight');
        }
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('highlight');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('highlight');
        if (!isProcessing) {
            const file = e.dataTransfer.files[0];
            handleImageFile(file);
        }
    });

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        handleImageFile(file);
    });

    // Action button handler
    actionButton.addEventListener('click', async () => {
        if (!uploadedImage || isProcessing) {
            showError('Please upload an image or wait for the current processing to complete.');
            return;
        }
        if (actionButton.innerText.includes('Start to Identify')) {
            isProcessing = true;
            actionButton.disabled = true;
            animateButton(actionButton, 'Identifying...', 'fas fa-spinner fa-spin');
            switchToProgressMode();
            try {
                const canvas = document.createElement('canvas');
                const tempCtx = canvas.getContext('2d');
                canvas.width = uploadedImage.width;
                canvas.height = uploadedImage.height;
                tempCtx.drawImage(uploadedImage, 0, 0);
                await startProcessingVisualization(canvas.toDataURL('image/jpeg', 0.9));
            } catch (error) {
                showError(`Identification Failed: ${error.message}`);
                console.error('Processing error:', error);
            } finally {
                isProcessing = false;
                setToReanalyse();
            }
        } else if (actionButton.innerText.includes('Re-Analyse')) {
            // 重新识别
            isProcessing = true;
            actionButton.disabled = true;
            animateButton(actionButton, 'Re-Analysing...', 'fas fa-spinner fa-spin');
            switchToProgressMode();
            try {
                const canvas = document.createElement('canvas');
                const tempCtx = canvas.getContext('2d');
                canvas.width = uploadedImage.width;
                canvas.height = uploadedImage.height;
                tempCtx.drawImage(uploadedImage, 0, 0);
                await startProcessingVisualization(canvas.toDataURL('image/jpeg', 0.9));
            } catch (error) {
                showError(`Re-Analyse Failed: ${error.message}`);
                console.error('Re-Analyse error:', error);
            } finally {
                isProcessing = false;
                setToReanalyse();
            }
        }
    });

    // Reset button handler
    resetButton.addEventListener('click', () => {
        if (isProcessing) {
            const confirm = window.confirm('Processing in Progress, Are You Sure to Reset?');
            if (!confirm) return;
        }
        animateButton(resetButton, 'Resetting...', 'fas fa-spinner fa-spin');
        setTimeout(() => {
            resetUI();
            displaySuccessMessage('Reset Successfully, You Can Upload a New Image.');
            setToIdentify();
        }, 500);
    });
    
    function handleImageFile(file) {
        if (!file.type.startsWith('image/')) {
            showError('Please select a valid image file.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage = new Image();
            uploadedImage.onload = function() {
                // Update preview
                previewArea.innerHTML = `
                    <div class="preview-image">
                        <img src="${e.target.result}" alt="Uploaded sneaker">
                        <div class="preview-overlay">
                            <i class="fas fa-check"></i>
                            <p>Image Ready</p>
                        </div>
                    </div>
                `;
                
                // Enable process button
                setToIdentify();
                
                // Add highlight effect
                uploadArea.classList.add('highlight');
                
                // Show success message
                displaySuccessMessage('Image uploaded successfully!');
            };
            uploadedImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // ============ Main Processing Function ============
    
    async function startProcessingVisualization(imageDataUrl) {
        try {
            isProcessing = true;
            
            // Step 1: Image preprocessing
            showProgress(10, "Preprocessing Image...");
            await sleep(800);
            
            // Step 2: Feature extraction
            showProgress(25, "Extracting Features...");
            await sleep(1000);
            
            // Step 3: Model loading
            showProgress(50, "Loading AI Model...");
            await sleep(600);
            
            // Step 4: Model inference
            showProgress(75, "AI Model Analysing...");
            const recognitionResult = await callBackendAPI(imageDataUrl);
            
            // Step 5: Result visualization
            showProgress(90, "Generating Results...");
            await sleep(400);
            
            // Step 6: Complete
            showProgress(100, "Complete!");
            await sleep(300);
            
            // Visualize results
            await visualizeResults(recognitionResult);
            
        } catch (error) {
            console.error('Processing error:', error);
            showError(error.message || 'An error occurred during processing. Please try again.');
        } finally {
            isProcessing = false;
        }
    }

    async function visualizeResults(result) {
        // Update result display
        updateResultDisplay(result);
        
        // Show success message
        displaySuccessMessage('Identification completed successfully!');
    }

    function updateResultDisplay(result) {
        const confidence = result.confidence;
        let confidenceClass = 'high';
        let confidenceIcon = 'fas fa-check-circle';
        
        if (confidence < 70) {
            confidenceClass = 'low';
            confidenceIcon = 'fas fa-exclamation-triangle';
        } else if (confidence < 85) {
            confidenceClass = 'medium';
            confidenceIcon = 'fas fa-info-circle';
        }
        
        recognitionResultDiv.innerHTML = `
            <div class="result-content">
                <div class="result-header">
                    <i class="fas fa-robot"></i>
                    <h3>AI Identification Results</h3>
                </div>
                
                <div class="result-item">
                    <div class="result-label">
                        <i class="fas fa-shoe-prints"></i>
                        Sneaker Model
                    </div>
                    <div class="result-value main-result">
                        ${result.shoeModel}
                    </div>
                </div>
                
                <div class="result-item">
                    <div class="result-label">
                        <i class="${confidenceIcon}"></i>
                        Confidence
                    </div>
                    <div class="result-value confidence-${confidenceClass}">
                        ${confidence.toFixed(2)}%
                    </div>
                </div>
                

                
                <div class="result-actions">
                    <button class="btn secondary-btn" onclick="window.print()">
                        <i class="fas fa-print"></i>
                        Print Results
                    </button>
                    <button class="btn secondary-btn" onclick="navigator.share && navigator.share({title: 'Sneaker Identification Results', text: 'Identification Result: ${result.shoeModel} (${confidence.toFixed(1)}%)'})">
                        <i class="fas fa-share"></i>
                        Share Results
                    </button>
                </div>
            </div>
        `;
        
        // Add result styles
        const style = document.createElement('style');
        style.textContent = `
            .result-content {
                text-align: left;
                width: 100%;
            }
            
            .result-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 1.5rem;
                padding-bottom: 0.75rem;
                border-bottom: 2px solid var(--gray-200);
            }
            
            .result-header i {
                font-size: 1.5rem;
                background: var(--gradient-primary);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .result-header h3 {
                font-family: var(--font-display);
                font-size: 1.25rem;
                color: var(--gray-800);
                margin: 0;
            }
            
            .result-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                padding: 0.75rem;
                background: var(--gray-50);
                border-radius: var(--radius-lg);
                border-left: 4px solid var(--primary-color);
            }
            
            .result-label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 500;
                color: var(--gray-700);
            }
            
            .result-value {
                font-weight: 600;
                color: var(--gray-800);
            }
            
            .main-result {
                font-size: 1.1rem;
                background: var(--gradient-primary);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .confidence-high { color: #22c55e; }
            .confidence-medium { color: #f59e0b; }
            .confidence-low { color: #ef4444; }
            
            .result-actions {
                display: flex;
                gap: 1rem;
                margin-top: 1.5rem;
                padding-top: 1rem;
                border-top: 1px solid var(--gray-200);
            }
            
            .result-actions .btn {
                flex: 1;
                font-size: 0.875rem;
                padding: 0.75rem 1rem;
            }
        `;
        
        if (!document.querySelector('#result-styles')) {
            style.id = 'result-styles';
            document.head.appendChild(style);
        }
    }

    // ============ Backend API Call ============
    
    async function callBackendAPI(imageDataUrl) {
        try {
            const response = await fetch('/sneaker_identification/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: imageDataUrl
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                return {
                    shoeModel: result.prediction.shoeModel,
                    confidence: result.prediction.confidence
                };
            } else {
                throw new Error(result.error || 'Prediction failed');
            }
            
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    }

    // ============ Utility Functions ============
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ============ Initialization ============
    
    // Set initial state
    resetUI();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'o':
                    e.preventDefault();
                    imageUpload.click();
                    break;
                case 'r':
                    e.preventDefault();
                    if (!isProcessing) resetUI();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (uploadedImage && !isProcessing) {
                        actionButton.click();
                    }
                    break;
            }
        }
    });
    
    // Add page visibility API support
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isProcessing) {
            console.log('Page Switched to Background, Processing Continues...');
        }
    });
    
    // Add error handling
    window.addEventListener('error', (event) => {
        console.error('Global Error:', event.error);
        if (isProcessing) {
            showError('Error Occurred During Processing, Please Refresh the Page and Try Again.');
        }
    });
    
    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`Page Loaded, Time Taken: ${loadTime.toFixed(2)}ms`);
        });
    }
    
    console.log('🚀 Sneaker Identification Application Initialised!');
    console.log('💡 Shortcuts:');
    console.log('   Ctrl/Cmd + O: Open File');
    console.log('   Ctrl/Cmd + R: Reset Interface');
    console.log('   Ctrl/Cmd + Enter: Start to Identify');
});