#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -ev

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1

docker-compose -f docker-compose.yml down

services=(
    "orderer.example.com"
    "ca.org1.example.com"
    "peer0.org1.example.com"
    "couchdb.org1.example.com"
    "cli.org1.example.com"
    "chaincode.org1.example.com"
    "ca.org2.example.com"
    "peer0.org2.example.com"
    "couchdb.org2.example.com"
    "cli.org2.example.com"
    "chaincode.org2.example.com"
)

echo ${services[@]} | xargs docker-compose -f docker-compose.yml up -d
docker ps -a

# wait for Hyperledger Fabric to start
# incase of errors when running later commands, issue export FABRIC_START_TIMEOUT=<larger number>
export FABRIC_START_TIMEOUT=10
#echo ${FABRIC_START_TIMEOUT}
sleep ${FABRIC_START_TIMEOUT}

# Create the channel
docker exec -w /tmp/channel-artifact cli.org1.example.com peer channel create -o orderer.example.com:7050 -c mychannel -f /opt/gopath/src/github.com/hyperledger/fabric/peer/config/channel.tx
# Join peer0.org1.example.com to the channel.
docker exec -w /tmp/channel-artifact cli.org1.example.com peer channel join -b mychannel.block
# Join peer0.org2.example.com to the channel.
docker exec -w /tmp/channel-artifact cli.org2.example.com peer channel join -b mychannel.block
