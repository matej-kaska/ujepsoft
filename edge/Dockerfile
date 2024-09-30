FROM alpine:3
RUN apk add --no-cache brotli nginx nginx-mod-http-brotli curl

COPY ujepsoft.conf /etc/nginx/http.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
EXPOSE 8000

HEALTHCHECK --interval=30m --timeout=10s \
    CMD curl -f http://localhost:8000 || exit 1