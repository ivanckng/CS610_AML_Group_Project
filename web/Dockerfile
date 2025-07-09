# Use the official Python image
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
# Copy the model file from within the build context
COPY model_bank/best_cnn_resnet50.pth model_bank/best_cnn_resnet50.pth

# Use gunicorn for production (for Flask)
CMD exec gunicorn --bind :8080 --workers 1 --threads 8 app:app

EXPOSE 8080 