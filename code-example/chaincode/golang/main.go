package main

import (
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type AmazonManagedBlockchainTemplate struct {
}

func (ambt *AmazonManagedBlockchainTemplate) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

func (ambt *AmazonManagedBlockchainTemplate) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

func main() {
	err := shim.Start(new(AmazonManagedBlockchainTemplate))
	if err != nil {
		fmt.Printf("Error: Starting AmazonManagedBlockchainTemplate Chaincode: %s", err)
	}
}
