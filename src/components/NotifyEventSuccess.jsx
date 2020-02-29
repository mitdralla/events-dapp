import React from 'react';
import makeBlockie from 'ethereum-blockies-base64';
import { Link } from 'react-router-dom';

function NotifyEventSuccess(props) {
	let rawTitle = props.createdEvent.name;
      var titleRemovedSpaces = rawTitle;
	  titleRemovedSpaces = titleRemovedSpaces.replace(/ /g, '-');

      var pagetitle = titleRemovedSpaces.toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');

	  let titleURL = "/event/"+pagetitle+"/" + props.createdEvent.eventId;
	return (
		<div className="notify">
			<a href={"https://rinkeby.etherscan.io/tx/" + props.hash} title={props.hash} target = "blank">
				<img src={makeBlockie(props.hash)} alt={props.hash} />
			</a>
			<a href={"https://rinkeby.etherscan.io/tx/" + props.hash} title={props.hash} target = "blank">Transaction success!</a>
            <Link to={titleURL}><p> Check out your EVENT here</p></Link>
		</div>
	);
}

export default NotifyEventSuccess;