FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir pyyaml httpx apscheduler

COPY scheduler.py .
COPY schedules.yml .

TZ=America/Sao_Paulo

CMD ["python", "scheduler.py"]
