FROM bitnami/nginx:latest

USER root
RUN install_packages curl
USER 1001

# Add a health check
HEALTHCHECK --interval=5m --timeout=10s \
    CMD curl -f http://localhost:8000 || exit 1