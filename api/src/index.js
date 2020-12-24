const dayjs = require("dayjs");
const cors = require("cors");
const express = require("express");
const AWS = require("aws-sdk");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

const node0 = {
  daddr: process.env.ETHERMINT_NODE_ADDR,
  laddr: process.env.ETHERMINT_RPC_ADDR,
  key: process.env.ETHERMINT_KEY_NAME,
};

const maxRetries = 10;

const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider(node0.laddr));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getCurrentAccount() {
  const currentAccounts = '0xD2aa195D683cb782685EBdaC2B76788349eF6579';
  return currentAccounts;
}


async function handleRequest(to, amount) {
  let from = await getCurrentAccount();
  let balance = await web3.eth.getBalance(from);
  console.log("balance: ", balance);
  if (parseInt(balance, 10) <= amount) {
    console.log(
      `Balance ${balance} less than requested amount ${amount}, making faucet request`
    );
    await requestFromFaucet();
  }

  if (
    process.env.ETHERMINT_PRIVATE_KEY == "0x" ||
    process.env.ETHERMINT_PRIVATE_KEY == undefined
  ) {
    console.error(
      "No private key set. Please make sure a valid private key is used for the faucet"
    );
    return Promise.reject(
      "Invalid faucet setup. Please contact the maintainer of the faucet for help."
    );
  }

  console.log("making transfer");
  let signedTx = await web3.eth.accounts.signTransaction(
    {
      to: to,
      from: from,
      value: amount,
      gasLimit: web3.utils.toHex(25000),
      gasPrice: web3.utils.toHex(20e9),
    },
    process.env.ETHERMINT_PRIVATE_KEY
  );
  console.log("signed tx");

  let receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log("sent transfer!", receipt);
  return Promise.resolve();
}

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", (req, res) => {
  const addressRequesting = req.body.address;
  const isAddress = Web3.utils.isAddress(addressRequesting);

  if (!isAddress) {
    res.status(400).send(JSON.stringify("This is not an ETH Address"));
  }
       try {
	  console.log(`Address ${addressRequesting}!`)
          handleRequest(addressRequesting, process.env.FAUCET_AMOUNT);
          res
            .status(200)
            .send(JSON.stringify(`Successfully sent to ${addressRequesting}`));
        } catch (error) {
          console.error(error);
          res
            .status(503)
            .send(
              JSON.stringify("There was an error. Please try again later.")
            );
        }
});

app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`)
);
