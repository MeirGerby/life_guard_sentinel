FROM python:3.11

WORKDIR /app

COPY . .
COPY ../../shared /app/shared

ENV PYTHONPATH=/app

RUN pip install fastapi uvicorn redis

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]