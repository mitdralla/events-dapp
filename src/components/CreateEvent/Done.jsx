import React from 'react';

function Done(props) {
	return (
		<div className="mt-5 text-center">
			<h3 className="mt-5">Done, your event has been uploaded!</h3>
			<p className="emoji"><span role="img" aria-label="sunglasses">😎🎸</span></p>
			<p>We will notify you as soon as the transaction has been confirmed. It will be available for users shortly.</p>
			<code>{props.message}</code>
		</div>
	);
}

export default Done;
