document.addEventListener("load", componentWillMount);
document.addEventListener("submit", submitHandler);

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
    instantiateContract();
}

/*
 * Function to display the resulted succesful transaction after registering your lyrics
 */
function displayLyrifySuccess() {
    let transactionHash = "";
    let currentSong = [];
    for (let i = 0; i < window.localStorage.length; i++ ){
        let storageKey = window.localStorage.key(i);
        let storageItem = window.localStorage.getItem(storageKey);
        let storageItemParsed = JSON.parse(storageItem);
        let id = Number(storageItemParsed.id);
        if (id === window.localStorage.length) {
            currentSong.push(window.localStorage.getItem(window.localStorage.key(i)));
            transactionHash = storageKey;
        }
    }
    console.log("transactionHash: ", transactionHash);
    console.log("localStorage: ", window.localStorage);
    console.log("currentSong: ", currentSong);
    console.log("Submission: ", JSON.parse(currentSong[0]));
    let newSong = JSON.parse(currentSong[0]);
    transactionHash = JSON.parse(transactionHash);
    console.log("Submission: ", newSong.songName);
    document.getElementById("songtitle").innerHTML = 'Title: ' + newSong.songName;
    document.getElementById("songlyrics").innerHTML = 'Lyrics: ' + newSong.lyrics;
    document.getElementById("author").innerHTML = 'Author: ' + newSong.ownerName;
    document.getElementById("hash").innerHTML = 'Hash: ' + transactionHash;
}

/*
 * Instantiates contract and updates global variables.
 */
function instantiateContract() {
    // Instantiate contract and set its web3 provider. This lets us access its functions.
    $.getJSON("LyrifyTokenOwnership.json", function (data) {
        const LyrifyTokenOwnership = data;
        const lyrifyContract = TruffleContract(LyrifyTokenOwnership);
        lyrifyContract.setProvider(web3.currentProvider);
   
        // Get accounts
        web3.eth.getAccounts((error, accounts) => {
            account = accounts[0];
            console.log("account: ", account);
        });
    
        // Set default account
        web3.eth.defaultAccount = web3.eth.accounts[0];
    
        // Create instance of contract at its deployed address (https://github.com/trufflesuite/truffle-contract).
        lyrifyContract.deployed().then(function (instance) {
            lyrifyInstance = instance;
            getTokens().then(result => {
                console.log("allTokens: ", result);
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
}

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
    console.log("The lyfif Instance: ", lyrifyInstance);

    submission.ownerName = document.getElementById("firstname").value + ' ' + document.getElementById("lastname").value;
    submission.email = document.getElementById("email").value;
    submission.songTitle = document.getElementById("title").value;
    submission.lyrics = document.getElementById("lyrics").value;
    event.preventDefault();
    return registerToken();
};

/*
 * Registers token, alerts user, and logs array of all tokens to console.
 */
function registerToken() {
    lyrifyInstance.registerToken(submission.email, submission.ownerName, submission.songTitle, submission.lyrics, {
        from: account,
        value: web3.toWei(0.004, "ether"), // hardcoded value
        gas: 999999 // need to optimize this
    }).then((result) => {
        console.log("registered token: ", result);
        let submissionConfirmation = JSON.stringify(result.logs[0].args);
        let transactionHash = JSON.stringify(result.tx)
        window.localStorage.setItem(transactionHash, submissionConfirmation);
        window.location.href = '/success.html';
        alert("registered token: " + submissionConfirmation + transactionHash);
        getTokens().then(result => {
            console.log("allTokens: ", result);
            allTokens = result;
        });
    }).catch(err => {
        console.warn("error in registerToken: ", err);
        throw err;
    });
}

/*
 * Helper function that returns a promise whose resulting value contains token details in an array.
 * @param {Number} id - The index of an array of all Lyrify tokens owned by an account.
 */
function getLyrifyTokenDetails(id) {
    return lyrifyInstance.lyrifyTokens(id);
};

/*
 * Returns a promise whose resulting value is an array of all tokens ever.
 */
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
        });
}
