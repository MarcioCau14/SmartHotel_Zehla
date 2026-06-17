FROM python:3.12-slim

WORKDIR /app

# Instalar curl para health check
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY loop_engine.py .
COPY rubric_engine.py .
COPY specs/ /app/specs/

RUN mkdir -p /app/output /var/log/zehla-loops

# Roda o motor em loop simulado ou scheduler dependendo da config
CMD ["python", "loop_engine.py"]
