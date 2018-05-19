# Lyrify

Lyrify is a decentralized application (DApp) that allows users to post text, such as song lyrics, to the Ethereum blockchain. This enables users to permanently store a record of their written work in the blockchain, which may be used to protect content creators against copyright infringement.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development purposes. 

### Installing

Follow these instructions to get a development environment up and running:

Clone the respository

```
git clone https://github.com/victorlearned/spuds.git
```

Install dependencies

```
npm i
```

Install testrpc

```
npm install -g ethereumjs-testrpc
```

Run testrpc in a terminal window

```
testrpc
```

Install truffle

```
npm install -g truffle
```

To compile and migrate the Solidity contracts, run the following commands in another terminal window:

```
truffle compile
truffle migrate --reset
```

Run the dev script

```
npm run dev
```

Clicking the Submit button on the home page will log to the console transaction details that includes the artist name, song title, and lyrics. This transaction will be mined into the Ethereum blockchain!

## Technologies Used

* [Truffle](https://github.com/trufflesuite/truffle) - Popular Ethereum development framework. 
* [Web3js](https://github.com/ethereum/web3.js/) - Ethereum JavaScript API.
* [Solidity](https://github.com/ethereum/solidity) - Contract-oriented programming language.
* [Open Zeppelin](https://github.com/OpenZeppelin/openzeppelin-solidity) - Framework to build secure smart contracts on Ethereum.
* [MetaMask](https://chrome.google.com/webstore/detail/metamask/) - Extension for accessing Ethereum enabled DApps in Google Chrome browser.

## Authors

* **Victor Learned** - https://github.com/victorlearned
* **Michelle Truong** - https://github.com/shelltr
* **Nigel Finley** - https://github.com/nfinley
* **Michael Malocha** - https://github.com/mjm159
* **Kyle Yasumiishi** - https://github.com/kyleyasumiishi

## License

This project is licensed under the MIT License.

