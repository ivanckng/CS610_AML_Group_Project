# Sneaker Recognition API Documentation

## Overview

This is a Flask-based API for sneaker recognition using a ResNet50 deep learning model.

## System Requirements

- Python 3.8+
- PyTorch 2.1.0+
- Flask 2.3.3+
- Other dependencies see `requirements.txt`

## Installation and Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Start API Server

```bash
python app.py
```

The API server will start at `http://localhost:5000`.

### 3. Access Web Interface

Open `index.html` in your browser.

## API Endpoints

### 1. Health Check
- **URL**: `GET /health`
- **Description**: Check API server status
- **Response**:
```json
{
    "status": "healthy",
    "model_loaded": true,
    "device": "cuda"
}
```

### 2. Sneaker Recognition
- **URL**: `POST /predict`
- **Description**: Upload image for sneaker identification
- **Request Body**:
```json
{
    "image": "base64 encoded image data"
}
```
- **Response**:
```json
{
    "success": true,
    "prediction": {
        "shoeModel": "nike_air_force_1_low",
        "confidence": 95.67
    }
}
```

## Supported Sneaker Types

The system can identify the following 50 sneaker types:

### Adidas
- adidas_forum_high
- adidas_forum_low
- adidas_gazelle
- adidas_nmd_r1
- adidas_samba
- adidas_stan_smith
- adidas_superstar
- adidas_ultraboost

### Asics
- asics_gel-lyte_iii

### Converse
- converse_chuck_70_high
- converse_chuck_70_low
- converse_chuck_taylor_all-star_high
- converse_chuck_taylor_all-star_low
- converse_one_star

### New Balance
- new_balance_327
- new_balance_550
- new_balance_574
- new_balance_990
- new_balance_992

### Nike
- nike_air_force_1_high
- nike_air_force_1_low
- nike_air_force_1_mid
- nike_air_jordan_1_high
- nike_air_jordan_1_low
- nike_air_jordan_11
- nike_air_jordan_3
- nike_air_jordan_4
- nike_air_max_1
- nike_air_max_270
- nike_air_max_90
- nike_air_max_95
- nike_air_max_97
- nike_air_max_plus_(tn)
- nike_air_vapormax_flyknit
- nike_air_vapormax_plus
- nike_blazer_mid_77
- nike_cortez
- nike_dunk_high
- nike_dunk_low

### Other Brands
- puma_suede_classic
- reebok_classic_leather
- reebok_club_c_85
- salomon_xt-6
- vans_authentic
- vans_old_skool
- vans_sk8-hi
- vans_slip-on_checkerboard
- yeezy_700_wave_runner
- yeezy_boost_350_v2
- yeezy_slide

## Image Preprocessing

The system uses the same preprocessing steps as during training:

1. Resize image to 224x224 pixels
2. Convert to PyTorch tensor
3. Normalize using ImageNet parameters

## Model Information

- **Model Architecture**: ResNet50
- **Training Data**: 50 sneaker classes, ~100-150 images per class
- **Model File**: `../model_bank/best_cnn_resnet50.pth`
- **Input Size**: 224x224 RGB image
- **Output**: 50 class probability distribution

## Usage Examples

### Python Client Example

```python
import requests
import base64

# Read image file
with open('shoe_image.jpg', 'rb') as f:
    image_data = base64.b64encode(f.read()).decode('utf-8')

# Send request
response = requests.post('http://localhost:5000/predict', 
                        json={'image': image_data})

# Process response
if response.status_code == 200:
    result = response.json()
    print(f"Prediction: {result['prediction']['shoeModel']}")
    print(f"Confidence: {result['prediction']['confidence']:.2f}%")
else:
    print(f"Error: {response.text}")
```

### JavaScript Client Example

```javascript
// Convert image to base64
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = image.width;
canvas.height = image.height;
ctx.drawImage(image, 0, 0);
const imageData = canvas.toDataURL('image/jpeg').split(',')[1];

// Send request
fetch('http://localhost:5000/predict', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        image: imageData
    })
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('Prediction:', data.prediction.shoeModel);
        console.log('Confidence:', data.prediction.confidence);
    }
})
.catch(error => console.error('Error:', error));
```

## Troubleshooting

### Common Issues

1. **Model loading failed**
   - Ensure `../model_bank/best_cnn_resnet50.pth` file exists
   - Check file permissions

2. **CUDA not available**
   - System automatically falls back to CPU mode
   - Performance will be slower but functionality remains

3. **Memory insufficient**
   - Reduce batch size
   - Use CPU mode

4. **CORS errors**
   - Ensure Flask-CORS is properly installed
   - Check browser console error messages

### Log Information

The API server outputs detailed log information including:
- Model loading status
- Request processing details
- Error messages

## Performance Optimization

1. **GPU Acceleration**: Install CUDA PyTorch if NVIDIA GPU available
2. **Model Quantization**: Further optimize model size and inference speed
3. **Caching**: Implement result caching for repeated requests

## License

This project is for educational and research purposes only. 