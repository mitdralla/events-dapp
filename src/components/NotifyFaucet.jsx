import React from 'react';
import makeBlockie from 'ethereum-blockies-base64';

function NotifyFaucet(props) {
	return (
		<div className="notify">
			<a href={"https://rinkeby.etherscan.io/tx/" + props.hash} title={props.hash} target="blank">
				<img src={makeBlockie(props.hash)} alt={props.hash} />
			</a>
			<a href={"https://rinkeby.etherscan.io/tx/" + props.hash} title={props.hash} target = "blank">Request for 10,000 Hydro</a> <span role="img" aria-labelledby="rocket">🚀 {props.tx}</span>
            <p className="mt-1">Your token request has been sent</p>
		</div>
	);
}

export default NotifyFaucet;