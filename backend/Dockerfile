FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml /app/pyproject.toml
COPY app /app/app
COPY alembic /app/alembic
COPY alembic.ini /app/alembic.ini
COPY scripts /app/scripts

RUN pip install --no-cache-dir -e .

EXPOSE 8000

CMD sh -lc "chmod +x /app/scripts/wait_for_db.sh && /app/scripts/wait_for_db.sh && alembic -c alembic.ini upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"

