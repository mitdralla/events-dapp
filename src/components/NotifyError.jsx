import React from 'react';
import makeBlockie from 'ethereum-blockies-base64';
import { Link } from 'react-router-dom';

function NotifyError(props) {
	return (
		<div className="notify">			
            <p className="emoji2"><span role="img" aria-label="sweat">😓</span></p>
			<p>Transaction failed, Please try again.</p>
		</div>
	);
}

export default NotifyError;