FROM bitnami/redis:7.2.4

USER root

RUN mkdir -p /data && chown -R 1001:0 /data

USER 1001

HEALTHCHECK --interval=5m --timeout=10s \
  CMD redis-cli ping || exit 1
