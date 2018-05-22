document.addEventListener("load", componentWillMount);
document.addEventListener("submit", submitHandler);

// Global variables 
let allTokens = null;
let ownedTokens = null;
let account = null;
let lyrifyInstance = null;
let submission = {
    name: '',
    songName: '',
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
 * Displays information about succesfully registered lyrics.
 */
function displayLyrifySuccess() {
    let transactionHash = JSON.parse(window.localStorage.key(0));
    let currentSong = JSON.parse(window.localStorage.getItem(window.localStorage.key(0)));
    
    console.log("id: ", currentSong.id);
    console.log("transactionHash: ", transactionHash);
    console.log("currentSong: ", currentSong);
    console.log("localStorage: ", window.localStorage);

    document.getElementById("id").innerHTML = 'ID: ' + currentSong.id;
    document.getElementById("songtitle").innerHTML = 'Title: ' + currentSong.songName;
    document.getElementById("songlyrics").innerHTML = 'Lyrics: ' + currentSong.lyrics;
    document.getElementById("author").innerHTML = 'Author: ' + currentSong.ownerName;
    document.getElementById("hash").innerHTML = 'Hash: ' + transactionHash;
}

/*
 * Instantiates contract and updates global variables.
 */
function instantiateContract() {
    // Instantiates contract and sets its web3 provider, which provides access to its functions.
    $.getJSON("LyrifyTokenOwnership.json", function (data) {
        const LyrifyTokenOwnership = data;
        const lyrifyContract = TruffleContract(LyrifyTokenOwnership);
        lyrifyContract.setProvider(web3.currentProvider);
   
        // Gets accounts.
        web3.eth.getAccounts((error, accounts) => {
            account = accounts[0];
            console.log("account: ", account);
        });
    
        // Sets default account.
        web3.eth.defaultAccount = web3.eth.accounts[0];
    
        // Creates instance of contract at its deployed address (for info on deployed address, see: https://github.com/trufflesuite/truffle-contract).
        lyrifyContract.deployed().then(function (instance) {
            lyrifyInstance = instance;
            console.log("lyrifyInstance: ", lyrifyInstance);
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
 * Gets tokens by account owner.
 */
function getLyrifyTokensByOwner(account) {
    return lyrifyInstance.getLyrifyTokensByOwner(account);
}

/*
 * Event handler for submit button that registers token with submission info.
 */
function submitHandler(event) {
    submission.name = document.getElementById("firstname").value + ' ' + document.getElementById("lastname").value;
    submission.songName = document.getElementById("title").value;
    submission.lyrics = document.getElementById("lyrics").value;
    event.preventDefault();
    return registerToken();
};

/*
 * Registers token and redirects user to success page.
 */
function registerToken() {
    // Registers token.
    lyrifyInstance.registerToken(submission.name, submission.songName, submission.lyrics, {
        from: account,
        value: web3.toWei(0.004, "ether"), // hardcoded value
        gas: 999999 // need to optimize this
    })
    // Adds registered token to allTokens array and redirects user to success page.
    .then((result) => {
        console.log("registered token: ", result);
        let submissionConfirmation = result.logs[0].args;
        let id = Number(submissionConfirmation.id);
        let transactionHash = result.tx;
        let token = {
            name: submissionConfirmation.ownerName,
            songName: submissionConfirmation.songName,
            lyrics: submissionConfirmation.lyrics,
            // hash: transactionHash
        }
        allTokens.push(token);
        // Clears window.localStorage so success page doesn't accidentally display previously registered tokens.
        window.localStorage.clear();
        window.localStorage.setItem(JSON.stringify(transactionHash), JSON.stringify(submissionConfirmation));
        window.location.href = '/success.html';
    })
    .catch(err => {
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
 * Returns a promise whose resulting value is an array of all tokens.
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
                        name: token[0],
                        songName: token[1],
                        lyrics: token[2]
                    }
                    return Promise.resolve(translatedToken);
                }));
            }
            return Promise.all(promises);
        });
}

/*
 * Searches the allTokens array by the song ID (i.e., index position) provided by the user and updates document with token info. 
 */
function searchByID() {
    let id = document.getElementById("enterid").value;
    // Input is blank or not a number.
    if (id === '' || isNaN(Number(id))) {
        document.getElementById("notification").style.display = "block";
        document.getElementById("notification").innerHTML = 'Please enter a valid ID.';
    } 
    // Input is not a valid song ID.
    else if (Number(id) > allTokens.length - 1 || Number(id) < 0) {
        document.getElementById("notification").style.display = "block";
        document.getElementById("notification").innerHTML = 'Song ID does not exist.'
    } 
    // Input is a valid song ID.
    else {
        document.getElementById("notification").style.display = "none";
        let token = allTokens[Number(id)];
        console.log(token);
        document.getElementById("id").innerHTML = 'ID: ' + id;  
        document.getElementById("songtitle").innerHTML = 'Title: ' + token.songName;
        document.getElementById("songlyrics").innerHTML = 'Lyrics: ' + token.lyrics;
        document.getElementById("author").innerHTML = 'Author: ' + token.name;
    }
}