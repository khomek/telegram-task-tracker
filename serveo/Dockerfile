FROM alpine:latest

RUN apk add --no-cache openssh-client bash

COPY run_tunnel.sh /run_tunnel.sh
RUN chmod +x /run_tunnel.sh

CMD ["/run_tunnel.sh"]