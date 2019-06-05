FROM nginx:1.17.0

RUN apt-get update && apt install -y git curl build-essential && \
	curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
	apt-get update && apt-get install -y nodejs && \
	mkdir -p /opt/gopath/src/github.com/hyperledger && \
	git clone -b v1.2.1 https://github.com/hyperledger/fabric.git /opt/gopath/src/github.com/hyperledger/fabric && \
	git clone -b v1.2.4 https://github.com/hyperledger/fabric-chaincode-node.git /usr/local/app

WORKDIR /usr/local/app
RUN npm install && \
	GERRIT_BRANCH=v1.2.4 GOPATH=/opt/gopath ./node_modules/gulp/bin/gulp.js docs && \
	rm -rf /usr/share/nginx/html && mv docs/gen/v1.2.4 /usr/share/nginx/html
