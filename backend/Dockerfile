FROM python:alpine3.19

ENV PYTHONDONTWRITEBYTECODE=1

ENV PYTHONUNBUFFERED=1

WORKDIR /backend

COPY requirements.txt .

RUN apk --no-cache add curl=8.5.0-r0 && \
  pip install --no-cache-dir -r requirements.txt

# Then copy the rest of the app
COPY . .

EXPOSE 8000

ENTRYPOINT ["/backend/entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

HEALTHCHECK --interval=30m --timeout=10s \
  CMD curl -f http://localhost:8000/api/test || exit 1
