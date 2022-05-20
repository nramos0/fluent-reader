FROM ubuntu:focal
WORKDIR /app
ADD target/release/fluent-reader-server ./fluent-reader-server
ADD target/release/.env ./.env
CMD ["/bin/bash", "-l", "-c", "/app/fluent-reader-server"]
