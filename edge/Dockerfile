FROM bitnami/nginx:1.26.0

USER root

RUN apt-get update && \
    apt-get install -y curl=7.88.1-10+deb12u5 --no-install-recommends

HEALTHCHECK --interval=30m --timeout=10s \
    CMD curl -f http://localhost:8000 || exit 1