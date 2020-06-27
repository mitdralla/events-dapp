import React, { Component } from 'react';

class Home extends Component {
	render() {
		return(
			<div className="home-wrapper">
				<h2>Welcome to the PhoenixDAO Events Marketplace.</h2>
				<hr />
				<p>The PhoenixDAO Events Marketplace is a dApp that allows people to create events and sell tickets online, with options to make a paid or free event.</p>
				<p>Tickets created on this service are ERC721 tokens, that means that users are free to move, gift or sell those tickets to other users.</p>
				<p>PhoenixDAO Events Marketplace is dApp powered by the Ethereum blockchain. In order to create events or purchase tickets, you should have an Ethereum wallet.</p>
			</div>
		);
	}
}

export default Home;
