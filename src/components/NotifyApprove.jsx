import React from 'react';
import makeBlockie from 'ethereum-blockies-base64';

function NotifyApprove(props) {
	return (
		<div className="notify">
			<a href={"https://rinkeby.etherscan.io/tx/" + props.hash} title={props.hash} target="blank">
				<img src={makeBlockie(props.hash)} alt={props.hash} />
			</a>
			<a href={"https://rinkeby.etherscan.io/tx/" + props.hash} title={props.hash} target = "blank">Transaction sent!</a> <span role="img" aria-labelledby="rocket">🚀 {props.tx}</span>
			<p className="mt-2"> Once Your approval is confirmed, you will be able to buy a ticket.</p>		
		</div>
	);
}

export default NotifyApprove;