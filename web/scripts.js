// ============ 现代化鞋类识别 JavaScript ============

document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素获取
    const imageUpload = document.getElementById('imageUpload');
    const uploadArea = document.getElementById('uploadArea');
    const progressArea = document.getElementById('progressArea');
    const sectionTitle = document.getElementById('sectionTitle');
    const titleText = document.getElementById('titleText');
    const browseLink = document.getElementById('browseLink');
    const previewArea = document.getElementById('previewArea');
    const processButton = document.getElementById('processButton');
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

    // ============ 工具函数 ============
    
    function switchToProgressMode() {
        // 隐藏上传区域，显示进度区域
        uploadArea.style.display = 'none';
        progressArea.style.display = 'flex';
        
        // 更改标题
        titleText.innerHTML = 'Identification Progress';
        
        // 显示重置按钮
        resetButton.style.display = 'inline-flex';
        
        // 初始化Canvas显示上传的图片
        if (uploadedImage) {
            // 设置canvas尺寸
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
            
            // 绘制图片到canvas
            ctx.clearRect(0, 0, shoeCanvas.width, shoeCanvas.height);
            ctx.drawImage(uploadedImage, 0, 0, shoeCanvas.width, shoeCanvas.height);
        }
    }
    
    function switchToUploadMode() {
        // 显示上传区域，隐藏进度区域
        uploadArea.style.display = 'block';
        progressArea.style.display = 'none';
        
        // 恢复标题
        titleText.innerHTML = 'Upload Your Sneaker Image';
        
        // 隐藏重置按钮
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
        // 确保progress area是可见的
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
        
        // 切换回上传模式
        switchToUploadMode();
        
        // 重置Canvas
        ctx.clearRect(0, 0, shoeCanvas.width, shoeCanvas.height);
        shoeCanvas.width = 0;
        shoeCanvas.height = 0;
        
        // 重置预览区域
        previewArea.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-image"></i>
                <p>Pending Image Uploaded</p>
            </div>
        `;
        
        // 重置结果区域
        recognitionResultDiv.innerHTML = `
            <div class="result-placeholder">
                <i class="fas fa-upload"></i>
                <p>Upload Image First</p>
            </div>
        `;
        
        // 重置按钮状态
        processButton.disabled = true;
        processButton.innerHTML = '<i class="fas fa-magic"></i> Start to Identify';
        
        // 重置上传区域
        uploadArea.style.pointerEvents = 'auto';
        uploadArea.classList.remove('highlight');
        
        // 隐藏加载和错误状态
        hideLoader();
        hideError();
        hideProgress();
        
        // 清空文件输入
        imageUpload.value = '';
    }

    function displaySuccessMessage(message, duration = 3000) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-toast';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // 添加成功提示的样式
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
        
        // 动画显示
        setTimeout(() => {
            successDiv.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            successDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(successDiv);
            }, 300);
        }, duration);
    }

    function animateButton(button, text, icon = '') {
        const originalContent = button.innerHTML;
        button.innerHTML = `${icon} ${text}`;
        button.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
        
        return originalContent;
    }

    // ============ 图片上传处理 ============
    
    browseLink.addEventListener('click', (e) => {
        e.preventDefault();
        imageUpload.click();
    });

    uploadArea.addEventListener('click', () => {
        if (!isProcessing) {
            imageUpload.click();
        }
    });

    // 拖拽功能
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

    function handleImageFile(file) {
        if (!file) return;
        
        // 文件类型验证
        if (!file.type.startsWith('image/')) {
            showError('Please upload a valid image file (JPG, JPEG, PNG).');
            return;
        }
        
        // 文件大小验证 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            showError('Image file too large, please select an image less than 10MB.');
            return;
        }
        
        hideError();
        showLoader("Loading Image...");
        
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImage = new Image();
            uploadedImage.onload = () => {
                try {
                    // 计算Canvas尺寸
                    const maxWidth = 700;
                    const scaleFactor = Math.min(maxWidth / uploadedImage.width, 1);
                    shoeCanvas.width = uploadedImage.width * scaleFactor;
                    shoeCanvas.height = uploadedImage.height * scaleFactor;

                    // 绘制图片
                    ctx.clearRect(0, 0, shoeCanvas.width, shoeCanvas.height);
                    ctx.drawImage(uploadedImage, 0, 0, shoeCanvas.width, shoeCanvas.height);

                    // 更新预览
                    previewArea.innerHTML = `
                        <img src="${e.target.result}" alt="Preview Uploaded Image">
                    `;

                    // 更新UI状态
                    processButton.disabled = false;
                    processButton.innerHTML = '<i class="fas fa-magic"></i> Start to Identify';
                    resetButton.style.display = 'inline-flex';
                    uploadArea.style.pointerEvents = 'none';
                    
                    recognitionResultDiv.innerHTML = `
                        <div class="result-placeholder">
                            <i class="fas fa-rocket"></i>
                            <p>Image Loaded Successfully, Click "Start to Identify" to Analyse.</p>
                        </div>
                    `;

                    hideLoader();
                    displaySuccessMessage('Image Uploaded Successfully!');
                    
                } catch (error) {
                    showError('Processing Failed, Please Try Again.');
                    console.error('Image processing error:', error);
                }
            };
            
            uploadedImage.onerror = () => {
                showError('Image Loading Failed, Please Check the File Format.');
                hideLoader();
            };
            
            uploadedImage.src = e.target.result;
        };
        
        reader.onerror = () => {
            showError('File Reading Failed, Please Try Again.');
            hideLoader();
        };
        
        reader.readAsDataURL(file);
    }

    // ============ 识别处理 ============
    
    processButton.addEventListener('click', async () => {
        if (!uploadedImage || isProcessing) {
            showError('Please upload an image or wait for the current processing to complete.');
            return;
        }
        
        isProcessing = true;
        processButton.disabled = true;
        animateButton(processButton, 'Identifying...', '<i class="fas fa-spinner fa-spin"></i>');
        
        // 切换到进度模式
        switchToProgressMode();
        
        try {
            // 使用上传的图片数据而不是canvas数据
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
            processButton.disabled = false;
            processButton.innerHTML = '<i class="fas fa-redo"></i> Reset';
        }
    });

    resetButton.addEventListener('click', () => {
        if (isProcessing) {
            const confirm = window.confirm('Processing in Progress, Are You Sure to Reset?');
            if (!confirm) return;
        }
        
        animateButton(resetButton, 'Resetting...', '<i class="fas fa-spinner fa-spin"></i>');
        
        setTimeout(() => {
            resetUI();
            displaySuccessMessage('Reset Successfully, You Can Upload a New Image.');
        }, 500);
    });

    async function startProcessingVisualization(imageDataUrl) {
        let animationFrameId;
        
        try {
            // 步骤1: 初始化
            showProgress(10, "Initialising AI Model...");
            await sleep(800);
            
            // 步骤2: 预处理
            showProgress(25, "Image Preprocessing...");
            await sleep(1000);
            
            // 视觉预处理效果
            ctx.clearRect(0, 0, shoeCanvas.width, shoeCanvas.height);
            ctx.drawImage(uploadedImage, 0, 0, shoeCanvas.width, shoeCanvas.height);
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
            ctx.fillRect(0, 0, shoeCanvas.width, shoeCanvas.height);
            ctx.globalAlpha = 1.0;
            
            // 步骤3: 特征提取
            showProgress(50, "Feature Extracting...");
            await sleep(1200);
            
            // 步骤4: 模型推理
            showProgress(75, "AI Model Analysing...");
            const recognitionResult = await callBackendAPI(imageDataUrl);
            
            // 步骤5: 结果可视化
            showProgress(90, "Generating Results...");
            await sleep(500);
            
            // 绘制最终结果
            await visualizeResults(recognitionResult);
            
            showProgress(100, "Identification Completed!");
            await sleep(800);
            
            hideProgress();
            displaySuccessMessage('Identification Completed!', 4000);
            
        } catch (error) {
            hideProgress();
            throw error;
        }
    }

    async function visualizeResults(result) {
        return new Promise((resolve) => {
            // 清除并重绘原图
            ctx.clearRect(0, 0, shoeCanvas.width, shoeCanvas.height);
            ctx.drawImage(uploadedImage, 0, 0, shoeCanvas.width, shoeCanvas.height);

            const bbox = result.bbox;
            const scaleX = shoeCanvas.width / uploadedImage.width;
            const scaleY = shoeCanvas.height / uploadedImage.height;

            let currentBoxWidth = 0;
            let currentBoxHeight = 0;
            const targetWidth = bbox[2] * scaleX;
            const targetHeight = bbox[3] * scaleY;

            const drawBoxAnimation = () => {
                // 重绘图片
                ctx.clearRect(0, 0, shoeCanvas.width, shoeCanvas.height);
                ctx.drawImage(uploadedImage, 0, 0, shoeCanvas.width, shoeCanvas.height);

                // 绘制动画边框
                ctx.strokeStyle = '#667eea';
                ctx.lineWidth = 3;
                ctx.setLineDash([8, 4]);
                ctx.strokeRect(bbox[0] * scaleX, bbox[1] * scaleY, currentBoxWidth, currentBoxHeight);
                ctx.setLineDash([]);

                if (currentBoxWidth < targetWidth || currentBoxHeight < targetHeight) {
                    currentBoxWidth = Math.min(targetWidth, currentBoxWidth + (targetWidth / 20));
                    currentBoxHeight = Math.min(targetHeight, currentBoxHeight + (targetHeight / 20));
                    requestAnimationFrame(drawBoxAnimation);
                } else {
                    // 绘制最终边框和标签
                    ctx.strokeStyle = '#667eea';
                    ctx.lineWidth = 4;
                    ctx.strokeRect(bbox[0] * scaleX, bbox[1] * scaleY, targetWidth, targetHeight);

                    // 标签背景
                    const text = `${result.shoeModel}`;
                    const confidence = `${result.confidence.toFixed(1)}%`;
                    
                    ctx.font = 'bold 16px Inter';
                    const textWidth = ctx.measureText(text).width;
                    const confWidth = ctx.measureText(confidence).width;
                    const maxWidth = Math.max(textWidth, confWidth);
                    
                    const labelX = bbox[0] * scaleX;
                    const labelY = bbox[1] * scaleY - 50;
                    
                    // 标签背景
                    ctx.fillStyle = 'rgba(102, 126, 234, 0.9)';
                    ctx.fillRect(labelX, labelY, maxWidth + 20, 45);
                    
                    // 标签文字
                    ctx.fillStyle = 'white';
                    ctx.fillText(text, labelX + 10, labelY + 18);
                    ctx.font = '14px Inter';
                    ctx.fillText(confidence, labelX + 10, labelY + 35);

                    // 更新结果显示
                    updateResultDisplay(result);
                    resolve();
                }
            };
            
            requestAnimationFrame(drawBoxAnimation);
        });
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
        
        // 生成前5个预测结果的HTML
        let top5HTML = '';
        if (result.top5_predictions && result.top5_predictions.length > 0) {
            top5HTML = `
                <div class="result-item">
                    <div class="result-label">
                        <i class="fas fa-list-ol"></i>
                        Top 5 Predictions
                    </div>
                    <div class="result-value">
                        <div class="top5-predictions">
                            ${result.top5_predictions.map((pred, index) => `
                                <div class="prediction-item ${index === 0 ? 'top-prediction' : ''}">
                                    <span class="prediction-rank">${index + 1}</span>
                                    <span class="prediction-name">${pred.class}</span>
                                    <span class="prediction-confidence">${(pred.confidence * 100).toFixed(1)}%</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
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
                
                ${top5HTML}
                
                <div class="result-item">
                    <div class="result-label">
                        <i class="fas fa-map-marker-alt"></i>
                        Detection Area
                    </div>
                    <div class="result-value">
                        [${result.bbox.map(v => Math.round(v)).join(', ')}]
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
        
        // 添加结果样式
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
                align-items: flex-start;
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
                min-width: 120px;
            }
            
            .result-value {
                font-weight: 600;
                color: var(--gray-800);
                flex: 1;
                text-align: right;
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
            
            .top5-predictions {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                width: 100%;
            }
            
            .prediction-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.5rem;
                background: white;
                border-radius: var(--radius-md);
                border: 1px solid var(--gray-200);
            }
            
            .prediction-item.top-prediction {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
            }
            
            .prediction-rank {
                font-weight: bold;
                min-width: 20px;
                text-align: center;
            }
            
            .prediction-name {
                flex: 1;
                font-size: 0.9rem;
            }
            
            .prediction-confidence {
                font-weight: 600;
                font-size: 0.85rem;
            }
            
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

    // ============ 后端API调用 ============
    
    async function callBackendAPI(imageDataUrl) {
        try {
            const response = await fetch('http://localhost:5000/predict', {
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
                    confidence: result.prediction.confidence,
                    bbox: [
                        uploadedImage.width * 0.15,
                        uploadedImage.height * 0.2,
                        uploadedImage.width * 0.7,
                        uploadedImage.height * 0.6
                    ],
                    top5_predictions: result.prediction.top5_predictions
                };
            } else {
                throw new Error(result.error || '预测失败');
            }
            
        } catch (error) {
            console.error('API调用错误:', error);
            throw error;
        }
    }

    // ============ 工具函数 ============
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ============ 初始化 ============
    
    // 设置初始状态
    resetUI();
    
    // 添加键盘快捷键
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
                        processButton.click();
                    }
                    break;
            }
        }
    });
    
    // 添加页面可见性API支持
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isProcessing) {
            console.log('Page Switched to Background, Processing Continues...');
        }
    });
    
    // 添加错误处理
    window.addEventListener('error', (event) => {
        console.error('Global Error:', event.error);
        if (isProcessing) {
            showError('Error Occurred During Processing, Please Refresh the Page and Try Again.');
        }
    });
    
    // 性能监控
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