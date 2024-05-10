FROM bitnami/redis:latest
USER root
RUN mkdir -p /data && chown -R 1001:0 /data

# Create user with no password (not for login)
RUN adduser --disabled-password --gecos "" ujepsoft
RUN chown -R ujepsoft:ujepsoft /data

USER ujepsoft

# Add a health check
HEALTHCHECK --interval=5m --timeout=10s \
  CMD redis-cli ping || exit 1
