FROM bitnami/nginx:1.26.0

USER root
RUN install_packages curl
USER 1001

HEALTHCHECK --interval=5m --timeout=10s \
    CMD curl -f http://localhost:8000 || exit 1