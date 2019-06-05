FROM nginx:1.17.0

WORKDIR /usr/local
RUN apt-get update && apt install -y git curl build-essential && \
	curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
	apt-get update && apt-get install -y nodejs && \
	git clone -b v1.2.2 https://github.com/hyperledger/fabric-sdk-node.git app

WORKDIR /usr/local/app
RUN npm install && \
	./node_modules/gulp/bin/gulp.js doc && \
	rm -rf /usr/share/nginx/html && mv docs/gen /usr/share/nginx/html
