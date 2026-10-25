FROM debian:trixie

COPY metrix_0.0.0_all.deb /tmp/

RUN apt-get update && apt-get -y install /tmp/metrix_0.0.0_all.deb procps && rm -rf /var/lib/apt/lists/* /tmp/metrix_0.0.0_all.deb

RUN mkdir /app

COPY metrix-entrypoint /usr/local/bin/

WORKDIR /app

CMD ["metrix-entrypoint"]
