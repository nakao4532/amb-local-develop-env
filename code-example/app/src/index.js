const FabricClient = require('fabric-client');
const FabricCAClient = require('fabric-ca-client').FabricCAClient;
const User = require('fabric-ca-client').User;

const enrollmentAdmin = async () => {
    const caname = 'ca.org1.example.com';
    const connect_opts = {
        protocol: 'http',
        hostname: caname,
        port: 7054,
    };
    fcc = new FabricCAClient(connect_opts);

    const cryptoSuite = FabricClient.newCryptoSuite();
    const privateKey = cryptoSuite.generateEphemeralKey()
    const csr = privateKey.generateCSR('CN=admin')
    const enrollResponse = await fcc.enroll('admin', 'adminpw', csr)
        .catch((err) => {
            console.log(`error = ${err}`);
            return err;
        });
    return {
        key: privateKey,
        certificate: enrollResponse.enrollmentCert,
        rootCertificate: enrollResponse.caCertChain,
    };
};

const getUserContextAdmin = async (enroll) => {
    const fc = new FabricClient();
    return await fc.createUser({
        username: 'admin',
        mspid: 'Org1MSP',
        cryptoContent: {
            privateKeyPEM: enroll.key.toBytes(),
            signedCertPEM: enroll.certificate,
        },
        skipPersistence: true,
    });
}

const configurationNetwork = (fc) => {
    const channel = fc.newChannel('mychannel');
    const peer = fc.newPeer('grpc://peer0.org1.example.com:7051');
    channel.addPeer(peer);
    const orderer = fc.newOrderer('grpc://orderer.example.com:7050');
    channel.addOrderer(orderer);
    return channel;
}

const queryChaincode = async (userContext) => {
    const fc = new FabricClient();
    fc.setUserContext(userContext, true);
    const channel = configurationNetwork(fc);
    const request = {
        chaincodeId: 'mycc',
        fcn: '',
        args: [''],
    };
    const queryResult = channel.queryByChaincode(request);
    if (queryResult && queryResult.length ==1) {
        if (queryResult[0] instanceof Error) {
            console.log(`error from query = ${queryResult[0]}`);
        } else {
            console.log(`Response is ${queryResult.toString()}`);
        }
    } else {
        console.log('No payloads were returned from query')
    }
    return queryResult;
};

const invokeChaincode = async (userContext) => {
    const fc = new FabricClient();
    fc.setUserContext(userContext, true);
    const channel = configurationNetwork(fc);
    const txId = fc.newTransactionID();
    const request = {
        chaincodeId: 'mycc',
        fcn: '',
        args: [''],
        chainId: 'mychannel',
        txId,
    }

    const verificationTransactionResult = await channel.sendTransactionProposal(request)
        .catch((err) => {
            console.log(`Error: verificationTransaction: ${err}`);
            return err;
        });
    if (verificationTransactionResult instanceof Error) {
        return verificationTransactionResult;
    }
    console.log(`verificationTransactionResult = ${JSON.stringify(verificationTransactionResult)}`);

    const proposalResponses = verificationTransactionResult[0];
    const proposal = verificationTransactionResult[1];
    if (proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200) {
        console.log('verification transaction is success!');
        const request = {
            proposalResponses,
            proposal,
        }
        const transactionResult = await channel.sendTransaction(request)
            .catch((err) => {
                console.log(`Error: sendTransaction: ${err}`);
                return err
            });
        if (transactionResult && transactionResult.status === 'SUCCESS') {
            console.log(`transactionResult = ${JSON.stringify(transactionResult)}`);
            return transactionResult
        }
    }
    return null;
}

const queryBlockHeight = async (userContext) => {
    const fc = new FabricClient();
    fc.setUserContext(userContext, true);
    const channel = configurationNetwork(fc);
    return await channel.queryInfo();
};

const queryCurrentBlock = async (userContext, blockHeight) => {
    const fc = new FabricClient();
    fc.setUserContext(userContext, true);
    const channel = configurationNetwork(fc);
    const blockNum = blockHeight.height.low;
    return await channel.queryBlock(blockNum - 1, undefined, false, false);
}

const main = async () => {
    const admin = await enrollmentAdmin();
    const userContext = await getUserContextAdmin(admin);
    const result = await invokeChaincode(userContext);
    const blockHight = await queryBlockHeight(userContext);
    const block = await queryCurrentBlock(userContext, blockHight);
    console.log(`block = ${JSON.stringify(block)}`);
}

main();
