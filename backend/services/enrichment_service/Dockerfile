FROM python:3.11

WORKDIR /app

COPY . .
COPY ../../shared /app/shared

ENV PYTHONPATH=/app

RUN pip install pydantic

CMD ["python", "main.py"]