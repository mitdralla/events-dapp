import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';

import Loading from './Loading';

class Token extends Component {
	constructor(props, context) {
		super(props);
		this.contracts = context.drizzle.contracts;
		this.balance = this.contracts['StableToken'].methods.balanceOf.cacheCall(this.props.accounts[0]);
	}

	mintToken = () => {
		this.contracts['StableToken'].methods.mint.cacheSend();
	}

	render() {
		let body = <Loading />;

		if (typeof this.props.contracts['StableToken'].balanceOf[this.balance] !== 'undefined') {
			let balance = this.context.drizzle.web3.utils.fromWei(this.props.contracts['StableToken'].balanceOf[this.balance].value);
			body =
				<div className="text-center mt-5">
					<h4>Your balance is: <img src="/images/hydro.png" width="25" alt="Hydro branding" />&nbsp;{balance}</h4>
					<button className="btn btn-dark mt-5" onClick={this.mintToken}>Get Hydro Tokens</button>
				</div>
			;
		}

		return (
			<div>
				<h2>Hydro Tokens</h2>
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
