FROM debian:bullseye-slim
WORKDIR /app
ADD target/release .
ADD .env .
CMD ["/app/fluent-reader-server"]