FROM golang:1.12.5

RUN mkdir -p /go/src/github.com/hyperledger
WORKDIR /go/src/github.com/hyperledger
RUN git clone -b v1.2.1 https://github.com/hyperledger/fabric.git
CMD ["godoc", "-http=:80"]
