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
    console.log("lyrify instance??", account);


    return lyrifyInstance.registerToken(submission.ownerName, submission.songTitle, submission.lyrics, {
        from: account,
        value: web3.toWei(0.004, "ether"), // hardcoded value
        gas: 500000
    }).then((result) => {
        console.log("registering token:", result);
    })
    
    
    // .then((error, result) => {
    //     if (error) {
    //         console.log(error);
    //     } else {
    //         alert('Token has been registered!');
    //         console.log(result);
    //     }
    // });
    console.log(lyrifyInstance);
};




