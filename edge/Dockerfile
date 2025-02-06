FROM alpine:3
RUN apk add --no-cache brotli nginx nginx-mod-http-brotli curl

RUN mkdir -p /var/cache/nginx /var/run/nginx /var/log/nginx \
    && chown -R nginx:nginx /var/cache/nginx /var/run/nginx /var/log/nginx

COPY ujepsoft.conf /etc/nginx/http.d/default.conf

USER nginx

EXPOSE 8000

HEALTHCHECK --interval=30m --timeout=10s \
    CMD curl -f http://localhost:8000 || exit 1

CMD ["nginx", "-g", "daemon off;"]