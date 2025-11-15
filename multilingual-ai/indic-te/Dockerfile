FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UVICORN_PORT=5002 \
    TRANSFORMERS_NO_ADVISORY_WARNINGS=1

WORKDIR /app

# minimal system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY indic_mt_te.py /app/indic_mt_te.py

EXPOSE 5002
CMD ["uvicorn", "indic_mt_te:app", "--host", "0.0.0.0", "--port", "5002"]