# Cloud Run Deployment Guide

This guide will help you deploy your Flask + PyTorch project to Google Cloud Run.

---

## 1. Prerequisites
- Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install)
- Authenticate and set your project:
  ```sh
  gcloud auth login
  gcloud config set project YOUR_PROJECT_ID
  ```
- Enable Cloud Run, Cloud Build, and Container Registry APIs:
  ```sh
  gcloud services enable run.googleapis.com cloudbuild.googleapis.com containerregistry.googleapis.com
  ```

---

## 2. Build and Push the Docker Image

In the `web` directory, run:

```sh
cd web
# Replace YOUR_PROJECT_ID with your actual GCP project ID
$env:PROJECT_ID="YOUR_PROJECT_ID"   # For PowerShell
$env:REGION="asia-southeast1"       # Or your preferred region
$env:IMAGE_NAME="sneaker-app"

gcloud builds submit --tag gcr.io/$env:PROJECT_ID/$env:IMAGE_NAME
```

---

## 3. Deploy to Cloud Run

```sh
gcloud run deploy $env:IMAGE_NAME `
  --image gcr.io/$env:PROJECT_ID/$env:IMAGE_NAME `
  --platform managed `
  --region $env:REGION `
  --allow-unauthenticated
```

- After deployment, the terminal will display the Cloud Run service URL.

---

## 4. (Optional) Bind a Custom Domain
- In the Cloud Run console, add a custom domain and follow the DNS setup instructions.
- See the official docs: [Cloud Run Custom Domains](https://cloud.google.com/run/docs/mapping-custom-domains)

---

## 5. Notes
- Cloud Run uses port 8080 by default (already set in the Dockerfile).
- Static resources and API paths remain under the `/sneaker_identification` prefix.
- To set environment variables, use `--set-env-vars` with `gcloud run deploy`.

---

## 6. Common Issues
- **Large image/slow build:** The Dockerfile uses `python:3.11-slim` for optimization.
- **Large model file:** Cloud Run instances have a 2GB memory limit. Consider reducing your model size if needed.
- **Dependency conflicts:** Ensure your `requirements.txt` does not contain conflicting packages.

---

If you have any questions or encounter issues, feel free to ask! 