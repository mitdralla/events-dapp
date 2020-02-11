import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import {Hydro_Testnet_Token_ABI, Hydro_Testnet_Token_Address} from '../config/hydrocontract_testnet.js';


import Loading from './Loading';

let numeral = require('numeral');

class Token extends Component {
	constructor(props, context) {

		try {
			var contractConfig = {
			  contractName: 'Hydro',
			  web3Contract: new context.drizzle.web3.eth.Contract(
				Hydro_Testnet_Token_ABI,
				Hydro_Testnet_Token_Address,	
			  ),
			  
			};
			context.drizzle.addContract(contractConfig);
			
		  } catch (e) {
			console.log("ERROR", Hydro_Testnet_Token_Address, e);
		  }
		super(props);
		this.state = {
			getHydro:'',
			
		}
		this.contracts = context.drizzle.contracts;
		this.balance = this.contracts['StableToken'].methods.balanceOf.cacheCall(this.props.accounts[0]);
		this.account = this.props.accounts[0];
		
	}

	mintToken = () => {
		this.setState({getHydro:this.contracts['Hydro'].methods.getMoreTokens()},()=>{
			this.props.getHydro(this.state.getHydro)
		});
	}

	getbalance = () =>{
		let checkHydro = this.contracts['Hydro'].methods.balanceOf.cacheCall(this.props.accounts[0])
		if (typeof this.props.contracts['Hydro'].balanceOf[checkHydro] !== 'undefined') {
		let hydroBalance = this.context.drizzle.web3.utils.fromWei(this.props.contracts['Hydro'].balanceOf[this.balance].value);
		return hydroBalance
		}
	}

	render() {
		let body = <Loading />;

		if (typeof this.props.contracts['StableToken'].balanceOf[this.balance] !== 'undefined') {
			//let balance = this.context.drizzle.web3.utils.fromWei(this.props.contracts['StableToken'].balanceOf[this.balance].value);
			let balance = this.getbalance()
			body =
				<div className="text-center mt-5" >
					<h4>Your balance is: <img src="/images/hydro.png" width="25" alt="Hydro branding" />&nbsp;{numeral(balance).format('0,0.00')}</h4>
					<button className="btn btn-dark mt-5" onClick={this.mintToken}>Get Hydro Tokens</button>
				</div>
			;
		}

		return (
			<div>
				<h2>Get Hydro Tokens</h2>
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
