#!/bin/sh
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
CHANNEL_NAME=mychannel

# remove previous crypto material and config transactions
rm -fr config/*
rm -fr crypto-config/*

# setup cli container
docker-compose up -d generate

# generate crypto material
docker-compose exec generate cryptogen generate --config=./crypto-config.yaml
if [ "$?" -ne 0 ]; then
  echo "Failed to generate crypto material..."
  docker-compose down
  exit 1
fi

# generate genesis block for orderer
docker-compose exec generate configtxgen --configPath=./ -profile TwoOrgOrdererGenesis -outputBlock ./config/genesis.block
if [ "$?" -ne 0 ]; then
  echo "Failed to generate orderer genesis block..."
  docker-compose down
  exit 1
fi

# generate channel configuration transaction
docker-compose exec generate configtxgen --configPath=./ -profile TwoOrgChannel -outputCreateChannelTx ./config/channel.tx -channelID $CHANNEL_NAME
if [ "$?" -ne 0 ]; then
  echo "Failed to generate channel configuration transaction..."
  docker-compose down
  exit 1
fi

# generate anchor peer transaction
docker-compose exec generate configtxgen --configPath=./ -profile TwoOrgChannel -outputAnchorPeersUpdate ./config/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for Org1MSP..."
  docker-compose down
  exit 1
fi

docker-compose exec generate mv ./crypto-config/peerOrganizations/org1.example.com/ca/*_sk ./crypto-config/peerOrganizations/org1.example.com/ca/ca.org1.example.com-key.pem
docker-compose exec generate mv ./crypto-config/peerOrganizations/org2.example.com/ca/*_sk ./crypto-config/peerOrganizations/org2.example.com/ca/ca.org2.example.com-key.pem
docker-compose down
