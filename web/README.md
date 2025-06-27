# Sneaker Recognition System

A modern AI-powered sneaker identification system using ResNet50 deep learning model.

## Features

- 🎯 **High Accuracy**: 95%+ identification accuracy
- ⚡ **Fast Processing**: < 3 seconds per image
- 🏷️ **50+ Brands**: Supports major sneaker brands (Nike, Adidas, Converse, etc.)
- 🌐 **Web Interface**: Modern, responsive web UI
- 🔒 **Privacy**: Local processing, no data uploaded to external servers

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Start the System

**Option A: Use the startup script (Recommended)**
```bash
python start_system.py
```

**Option B: Manual startup**
```bash
# Start the API server
python app.py

# Open index.html in your browser
```

### 3. Use the System

1. Open `index.html` in your browser
2. Upload a sneaker image (JPG, JPEG, PNG)
3. Click "Start to Identify"
4. View the results with confidence scores

## System Architecture

- **Backend**: Flask API with PyTorch ResNet50 model
- **Frontend**: Modern HTML5/CSS3/JavaScript interface
- **Model**: Pre-trained ResNet50 fine-tuned on 50 sneaker classes
- **Preprocessing**: ImageNet normalization (224x224 RGB)

## Supported Brands

### Nike
- Air Force 1 (High, Low, Mid)
- Air Jordan (1, 3, 4, 11)
- Air Max (1, 90, 95, 97, 270, Plus, Vapormax)
- Blazer, Cortez, Dunk

### Adidas
- Forum, Gazelle, NMD R1
- Samba, Stan Smith, Superstar, Ultraboost

### Other Brands
- Converse (Chuck Taylor, One Star)
- New Balance (327, 550, 574, 990, 992)
- Vans, Puma, Reebok, Asics, Salomon, Yeezy

## API Endpoints

- `POST /predict` - Upload image for sneaker identification
- `GET /health` - Check API server status
- `GET /` - API information

## File Structure

```
web/
├── app.py                 # Flask API server
├── start_system.py        # System startup script
├── requirements.txt       # Python dependencies
├── index.html             # Web interface
├── scripts.js             # Frontend logic
├── style.css              # Styling
├── README.md              # This file
└── README_API.md          # Detailed API documentation
```

## Requirements

- Python 3.8+
- PyTorch 2.1.0+
- Flask 2.3.3+
- Modern web browser

## Troubleshooting

### Common Issues

1. **Model not found**: Ensure `../model_bank/best_cnn_resnet50.pth` exists
2. **Dependencies missing**: Run `pip install -r requirements.txt`
3. **CORS errors**: Check browser console, ensure API is running
4. **CUDA not available**: System automatically falls back to CPU

### Performance Tips

- Use GPU if available (install CUDA PyTorch)
- Optimize image size before upload
- Close other applications to free memory

## Development

### Training the Model

The model was trained using `new_cnn.ipynb` with:
- ResNet50 architecture
- ImageNet pretrained weights
- 50 sneaker classes
- Data augmentation techniques

### Customization

- Modify `app.py` to change API behavior
- Update `scripts.js` for frontend changes
- Adjust preprocessing in `val_test_transform`

## License

This project is for educational and research purposes.

## Team

CS610 Group 8 - AI/ML Engineers
- Cedric KOH Bo Xiang
- GAN Seng Zhan  
- GOH Yun Si
- HUANG Mochen
- WU Junqi 