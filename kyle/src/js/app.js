document.addEventListener("load", componentWillMount);

// Global variables (similar to properties in a React component's state object).
let allTokens = null;
let ownedTokens = null;
let web3;
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
        web3 = new Web3(web3.currentProvider);
    } else {
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
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
            account = accounts[0];
        });
    
        // Set default account - why?
        web3.eth.defaultAccount = web3.eth.accounts[0];
    
        // Create instance of contract at its deployed address (https://github.com/trufflesuite/truffle-contract).
        lyrifyContract.deployed().then(function(instance) {
            lyrifyInstance = instance;
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

    ///////////////////////////////////////////////////////////////////
    //=> TODO: Implement getLyrifyTokensByOwner
    ///////////////////////////////////////////////////////////////////

    return lyrifyInstance.getLyrifyTokensByOwner(account).call();
}

/*
 * Event handler for submit button that registers token with submission info.
 */
function submitHandler(event) {
    submission.ownerName = document.getElementById("firstname").value + ' ' + document.getElementById("lastname").value;
    submission.songTitle = document.getElementById("title").value;
    submission.lyrics = document.getElementById("lyrics").value;
    alert('Your lyrics were submitted! ' + JSON.stringify(submission));
    event.preventDefault();
    console.log(lyrifyInstance);
    return lyrifyInstance.registerToken(submission.ownerName, submission.songTitle, submission.lyrics, {
        from: account,
        value: web3.toWei(0.004, "ether"), // hardcoded value
        gas: 500000
    }).then((error, result) => {
        if (error) {
            console.log(error);
        } else {
            alert('Token has been registered!');
            console.log(result);
        }
    });
};




