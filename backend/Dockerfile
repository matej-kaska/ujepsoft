FROM python:alpine3.19

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /backend

# First, ensure the requirements file is present
COPY requirements.txt .

# Install dependencies
RUN apk --no-cache add curl && \
  pip install --no-cache-dir -r requirements.txt

# Then copy the rest of the app
COPY . .

# Create and use non-root user
RUN adduser -D ujepsoft && chown -R ujepsoft:ujepsoft /backend
USER ujepsoft

EXPOSE 8000

ENTRYPOINT ["/backend/entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Add a health check
HEALTHCHECK --interval=5m --timeout=10s \
  CMD curl -f http://localhost:8000/api/test || exit 1
