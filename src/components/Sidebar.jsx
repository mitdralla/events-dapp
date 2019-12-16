import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import makeBlockie from 'ethereum-blockies-base64';

class Sidebar extends Component {
	render() {
		let user =
			<div>
				<div className="user-status-icon">
					<i className="fas fa-plug"></i>
				</div>
				<p className="mt-3 small">Ethereum network not connected</p>
			</div>
		;

		if (this.props.connection === true) {
			user =
				<div>
					<div className="user-status-icon">
						<img src={makeBlockie(this.props.account)} alt={this.props.account} />
					</div>
					<p className="mt-3 small text-truncate h-25">Hello, {this.props.account}</p>
				</div>
			;
		}

		return (
			<div id="sidebar-wrapper" className="my-sidebar text-center">
				<div className="user-status mt-5">
					{user}
				</div>
				<div className="menu mt-5">
					<h5>Events & Tickets</h5>
					<ul className="nav flex-column">
						<li className="nav-item">
							<Link to="/findevents/1" className="nav-link">Find Events</Link>
						</li>
						<li className="nav-item">
							<Link to="/mytickets/1" className="nav-link">My Tickets</Link>
						</li>
					</ul>
					<h5 className="mt-5">Manage Events</h5>
					<ul className="nav flex-column">
						<li className="nav-item">
							<Link to="/createevent" className="nav-link">Create event</Link>
						</li>
						<li className="nav-item">
							<Link to="/myevents/1" className="nav-link">My Events</Link>
						</li>
					</ul>
					<h5 className="mt-5">Tools</h5>
					<ul className="nav flex-column">
						<li className="nav-item">
							<Link to="/token" className="nav-link">Get Hydro Tokens</Link>
						</li>
					</ul>
					<br />
					<a aria-label="Homepage" title="GitHub" class="footer-octicon d-none d-lg-block mx-lg-4" href="https://github.com/mitdralla/events-dapp">
      			<svg height="32" class="octicon octicon-mark-github" viewBox="0 0 16 16" version="1.1" width="32" aria-hidden="true"><path fill="#fff" fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
					</a>
				</div>
			</div>
		);
	}
}

export default Sidebar;
