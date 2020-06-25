import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import {PhoenixDAO_Testnet_Token_ABI, PhoenixDAO_Testnet_Token_Address} from '../config/phoenixDAOcontract_testnet.js';


import Loading from './Loading';

let numeral = require('numeral');



class Token extends Component {
	constructor(props, context) {

		try {
			var contractConfig = {
			  contractName: 'PHNX',
			  web3Contract: new context.drizzle.web3.eth.Contract(
				PhoenixDAO_Testnet_Token_ABI,
				PhoenixDAO_Testnet_Token_Address,
			  ),

			};
			context.drizzle.addContract(contractConfig);

		  } catch (e) {
			console.log("ERROR", PhoenixDAO_Testnet_Token_Address, e);
		  }
		super(props);
		this.state = {
			getPhoenixDAO:'',
			balance:'',

		}
		this.contracts = context.drizzle.contracts;
		this.balance = this.contracts['StableToken'].methods.balanceOf.cacheCall(this.props.accounts[0]);
		this.account = this.props.accounts[0];

	}

	componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){this.interval=setInterval(()=>this.getbalance(),1500)}
	}

	componentWillUnmount(){
		this._isMounted = false;
		clearInterval(this.interval)
    }

	mintToken = () => {
		this.setState({getPhoenixDAO:this.contracts['PHNX'].methods.getMoreTokens()},()=>{
			this.props.getPhoenixDAO(this.state.getPhoenixDAO)
		});
	}

	getbalance = () =>{
		let checkPhoenixDAO = this.contracts['PHNX'].methods.balanceOf.cacheCall(this.props.accounts[0])
		if (typeof this.props.contracts['PHNX'].balanceOf[checkPhoenixDAO] !== 'undefined') {
		let phoenixDAOBalance = this.context.drizzle.web3.utils.fromWei(this.props.contracts['PHNX'].balanceOf[this.balance].value);
		return phoenixDAOBalance
		}
	}

	render() {
		let body = <Loading />;

		if (typeof this.props.contracts['StableToken'].balanceOf[this.balance] !== 'undefined') {
			//let balance = this.context.drizzle.web3.utils.fromWei(this.props.contracts['StableToken'].balanceOf[this.balance].value);
			let balance = this.getbalance()

			body =
				<div className="text-center mt-5" >
					<h4>Your balance is: <img src="/images/hydro.png" width="25" alt="PhoenixDAO branding" />&nbsp;{numeral(balance).format('0,0.00')}</h4>
					<button className="btn btn-dark mt-5" onClick={this.mintToken}>Get PHNX Tokens</button>
				</div>
			;
		}

		return (
			<div>
				<h2>Get PHNX Tokens</h2>
				<hr />
				{body}
			</div>
		);
	}
}

Token.contextTypes = {
    drizzle: PropTypes.object
}

const mapStateToProps = state => {
    return {
		contracts: state.contracts,
		accounts: state.accounts
    };
};

const AppContainer = drizzleConnect(Token, mapStateToProps);
export default AppContainer;
