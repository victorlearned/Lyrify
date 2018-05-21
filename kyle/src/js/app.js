document.addEventListener("load", componentWillMount);

// Global variables (similar to properties in a React component's state object).
let allTokens = null;
let ownedTokens = null;
let account = null;
let lyrifyInstance = null;
let submission = {
    ownerName: '',
    songTitle: '',
    lyrics: '',
};

/*
 * Sets web3 provider and invokes contract instantiation.
 */
function componentWillMount() {
    if (typeof web3 !== 'undefined') {
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.log('MetaMask failed to inject web3');
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    console.log("web3: ", web3);
    console.log("web3.eth: ", web3.eth);
    instantiateContract();
};

/*
 * Instantiates contract and updates global variables.
 */
function instantiateContract() {
    // Instantiate contract and set its web3 provider. This lets us access its functions.
    $.getJSON("LyrifyTokenOwnership.json", function(data) {
        const LyrifyTokenOwnership = data;
        const lyrifyContract = TruffleContract(LyrifyTokenOwnership);
        lyrifyContract.setProvider(web3.currentProvider);
   
        // Get accounts - why?
        web3.eth.getAccounts((error, accounts) => {
            console.log("web3.eth.getAccounts: ", accounts);
            account = accounts[0];
            console.log("account: ", account);
        });
    
        // Set default account - why?
        web3.eth.defaultAccount = web3.eth.accounts[0];
        console.log("web3.eth", web3.eth);
    
        // Create instance of contract at its deployed address (https://github.com/trufflesuite/truffle-contract).
        lyrifyContract.deployed().then(function(instance) {
            lyrifyInstance = instance;
            getTokens().then(result => {
                console.log("alltokens", result);

                allTokens = result;
            }); 
        });

        ///////////////////////////////////////////////////////////////////
        //=> TODO: Implement ownerLyrifyTokenCount
        ///////////////////////////////////////////////////////////////////

        // JSON stringify the default account's owned tokens.
        // lyrifyContract.deployed().then(function(instance) {
        //     lyrifyInstance = instance;
        //     return lyrifyInstance.ownerLyrifyTokenCount(web3.eth.defaultAccount)
        // }).then((result) => {
        //     ownedTokens = JSON.stringify(result);
        // });
    });
};

/*
 * Get tokens by account owner.
 */
function getLyrifyTokensByOwner(account) {
    return lyrifyInstance.getLyrifyTokensByOwner(account);
}

/*
 * Event handler for submit button that registers token with submission info.
 */
function submitHandler(event) {
    submission.ownerName = document.getElementById("firstname").value + ' ' + document.getElementById("lastname").value;
    submission.email = document.getElementById("email").value;
    submission.songTitle = document.getElementById("title").value;
    submission.lyrics = document.getElementById("lyrics").value;
    alert('Your lyrics were submitted! ' + JSON.stringify(submission));
    event.preventDefault();


    return lyrifyInstance.registerToken(submission.email, submission.ownerName, submission.songTitle, submission.lyrics, {
        from: account,
        value: web3.toWei(0.004, "ether"), // hardcoded value
        gas: 999999 // need to optimize this
    }).then((result) => {
        console.log("registering token:", result);
        let submissionConfirmation = JSON.stringify(result.logs[0].args);
        let transactionHash = JSON.stringify(result.tx)
        alert("registered token: " + submissionConfirmation + transactionHash);
    });
    console.log(lyrifyInstance);
};

function getLyrifyTokenDetails(id) {
    return lyrifyInstance.lyrifyTokens(id);
}

// List of all tokens ever
function getTokens() {
    // The following are not filtered by account owner WHATSOEVER...
    // But we can fake this right...
    let tokens = [];
    return getLyrifyTokensByOwner(account)
        .then(tokensIndexList => { // TODO: fix this...something in the contract is wrong
            console.log("Owned tokens list", tokensIndexList);
            const promises = [];
            for (let i = 0; i < tokensIndexList.length; i++) {
                promises.push(getLyrifyTokenDetails(i).then(token => {
                    const translatedToken = {
                        email: token[0],
                        name: token[1],
                        songName: token[2],
                        lyrics: token[3]
                    }
                    return Promise.resolve(translatedToken);
                }));
            }
            return Promise.all(promises);
        })
}
