import React, { Component } from 'react'
// import LyrifyTokenFactory from '../build/contracts/LyrifyTokenFactory.json';
import LyrifyTokenOwnership from '../build/contracts/LyrifyTokenOwnership.json';
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      allTokens: null,
      ownedTokens: null,
      web3: null,
      account: null, // Should handle multiple accounts
      lyrifyInstance: null
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch((error) => {
      console.log('Error finding web3.', error);
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract');
    const lyrifyContract = contract(LyrifyTokenOwnership);
    lyrifyContract.setProvider(this.state.web3.currentProvider);
    // const simpleStorage = contract(SimpleStorageContract)
    // simpleStorage.setProvider(this.state.web3.currentProvider)

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.setState({
        account: accounts[0],
      });

      // not a good idea to mutate state :/
      this.state.web3.eth.defaultAccount = this.state.web3.eth.accounts[0]; // probably not a good idea

      lyrifyContract.deployed().then((instance) => {
        this.setState({
          lyrifyInstance: instance
        });
        return this.state.lyrifyInstance;
      }).then((result) => {
        // return this.state.lyrifyInstance.getLyrifyTokensByOwner(accounts[0]);
        return this.state.lyrifyInstance.ownerLyrifyTokenCount(this.state.account)
      }).then((result) => {
console.log("result", result);
        this.setState({
          ownedTokens: JSON.stringify(result)
        });

        /*this.state.lyrifyInstance.lyrifyTokens(tokenId.toNumber())
          .then((result) => {
            console.log("result is, ", JSON.stringify(result));
          });*/
      })
    });
  }

  getLyrifyTokensByOwner(account) {
    return this.state.lyrifyInstance.getLyrifyTokensByOwner(account).call();
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Good to Go!</h1>
              <h2>Lyrify Tokens List</h2>
              <p>The stored value is: {this.state.ownedTokens}</p>

              <EssayForm 
                lyrifyInstance={this.state.lyrifyInstance} 
                account={this.state.account}
                web3={this.state.web3}
              ></EssayForm>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

class EssayForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ownerName: '',
      songTitle: '',
      lyrics: '', 
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const name = target.name;
    this.setState({
      [name]: target.value
    });
  }

  handleSubmit(event) {
    alert('An essay was submitted: ' + JSON.stringify(this.state));
    event.preventDefault();
console.log("lyrify instance??", this.props.account);

    return this.props.lyrifyInstance.registerToken(this.state.ownerName, this.state.songTitle, this.state.lyrics, {
      from: this.props.account,
      value: this.props.web3.toWei(0.004, "ether"), // hardcoded value
      gas: 500000
    })
      .then((result) => {
        console.log("registering token:", result);
      });
  }

  render() {
    return (
      <form className="pure-form" onSubmit={this.handleSubmit}>
        <fieldset className="pure-group">
          <input className="pure-input-1-2" name="ownerName" value={this.state.ownerName} onChange={this.handleChange} placeholder="Owner Name"/>
          <input className="pure-input-1-2" name="songTitle" value={this.state.songTitle} onChange={this.handleChange} placeholder="Song Title"/>
          <textarea className="pure-input-1-2" name="lyrics" value={this.state.lyrics} onChange={this.handleChange} placeholder="Lyrics"/>
        </fieldset>
        <input type="submit" className="pure-button pure-button-primary" value="Register New Song" />
      </form>
    );
  }
}


export default App
