FROM python:3.11

WORKDIR /app

COPY . .
COPY ../../shared /app/shared

ENV PYTHONPATH=/app

RUN pip install kafka-python redis pydantic

CMD ["python", "app/main.py"]