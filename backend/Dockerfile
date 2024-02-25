FROM python:alpine3.19

ENV PYTHONDONTWRITEBYTECODE=1

ENV PYTHONUNBUFFERED=1

WORKDIR /backend

COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

ENTRYPOINT ["/backend/entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]