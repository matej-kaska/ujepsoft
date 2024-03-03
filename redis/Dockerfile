FROM bitnami/redis:latest
USER root
RUN mkdir -p /data && chown -R 1001:0 /data
USER 1001
# Add a health check
HEALTHCHECK --interval=30s --timeout=10s \
  CMD redis-cli ping || exit 1
