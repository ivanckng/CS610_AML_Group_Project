FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --upgrade pip && pip install -r requirements.txt
ENV PORT=8080
CMD exec gunicorn --bind :$PORT app:application 