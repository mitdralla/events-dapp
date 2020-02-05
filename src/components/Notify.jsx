import React from 'react';
import makeBlockie from 'ethereum-blockies-base64';

function Notify(props) {
	return (
		<div className="notify">
			<a href={"https://rinkeby.etherscan.io/tx/" + props.hash} title={props.hash} target="blank">
				<img src={makeBlockie(props.hash)} alt={props.hash} />
			</a>
			<a href={"https://rinkeby.etherscan.io/tx/" + props.hash} title={props.hash} target = "blank">Transaction sent!</a> <span role="img" aria-labelledby="rocket">🚀 {props.tx}</span>
		</div>
	);
}

export default Notify;
