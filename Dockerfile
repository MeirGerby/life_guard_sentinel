# שלב 1: בנייה והתקנת תלויות
FROM python:3.11-slim as builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1 
ENV PYTHONPATH=/

WORKDIR /app

# RUN apt-get update && apt-get install -y \
#     build-essential \
#     pkg-config \
#     libmariadb-dev \
#     && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./
RUN pip install --no-cache-dir --prefix=/install .

FROM builder as api-service
WORKDIR /app
COPY --from=builder /install /usr/local
COPY . .
CMD ["python", "-m", "uvicorn", "backend.services.api_service.main:app", "--host", "0.0.0.0", "--port", "8000"]

FROM builder as processing-service

WORKDIR /app
COPY --from=builder /install /usr/local
COPY . .

CMD ["python", "-m", "backend.services.processing_service.main"]
FROM builder as enrichment-service

WORKDIR /app
COPY --from=builder /install /usr/local
COPY . .

CMD ["python", "-m", "backend.services.enrichment_service.main"]

FROM builder as simulator-service

WORKDIR /app
COPY --from=builder /install /usr/local
COPY . .

CMD ["python", "-m", "backend.services.simulator_service.main"]

