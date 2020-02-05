import React from 'react';
import makeBlockie from 'ethereum-blockies-base64';

function NotifyApproveSuccess(props) {
	return (
		<div className="notify">
			<a href={"https://rinkeby.etherscan.io/tx/" + props.hash} title={props.hash} target = "blank">
				<img src={makeBlockie(props.hash)} alt={props.hash} />
			</a>
			<a href={"https://rinkeby.etherscan.io/tx/" + props.hash} title={props.hash} target = "blank">Transaction successful!</a>
            <p> You can buy a ticket now.</p>
		</div>
	);
}

export default NotifyApproveSuccess;