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
}

/*
Function to display the resulted succesful transaction after registering your lyrics
 */
function displayLyrifySuccess() {
    let currentSong = [];
    for (let i = 0; i < window.localStorage.length; i++ ){
        if(i === window.localStorage.length -1){
            currentSong.push(window.localStorage.getItem(window.localStorage.key(i)))
        }
    }
    console.log("Submission: ", JSON.parse(currentSong[0]));
    let newSong = JSON.parse(currentSong[0]);
    console.log("Submission: ", newSong.songName);
    document.getElementById("songtitle").innerHTML = 'Title: ' + newSong.songName;
    document.getElementById("songlyrics").innerHTML = newSong.lyrics;
    document.getElementById("author").innerHTML = 'Author: ' + newSong.ownerName;
    // document.getElementById("hash").innerHTML = transactionHash;
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
        lyrifyContract.deployed().then(function (instance) {
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
}

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
    console.log("The lyfif Instance: ", lyrifyInstance);

    submission.ownerName = document.getElementById("firstname").value + ' ' + document.getElementById("lastname").value;
    submission.songTitle = document.getElementById("title").value;
    submission.lyrics = document.getElementById("lyrics").value;
    event.preventDefault();
    console.log("lyrify instance??", account);


    return lyrifyInstance.registerToken(submission.ownerName, submission.songTitle, submission.lyrics, {
        from: account,
        value: web3.toWei(0.004, "ether"), // hardcoded value
        gas: 3000000
    })
        .then((result) => {
            alert('Your lyrics were submitted! ' + JSON.stringify(submission));
            console.log("registering token:", result);
            let submissionConfirmation = JSON.stringify(result.logs[0].args);
            let transactionHash = JSON.stringify(result.tx);
            // let songObj = Object.assign({},
            //     {submissionConfirmation: JSON.parse(submissionConfirmation),
            //     transactionHash: JSON.parse(transactionHash) }
            // );
            window.localStorage.setItem(transactionHash, submissionConfirmation);

            window.location.href = '/success.html';

            alert("registered token: " + submissionConfirmation + transactionHash);
        })
        .catch(err => {
            console.warn("error in registerToken: ", err);
            throw err
        });
}




