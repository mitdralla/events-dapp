import React, { Component } from 'react';
import {Link,NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import makeBlockie from 'ethereum-blockies-base64';

class Sidebar extends Component
{

	constructor(props, context)
  {
      super(props);
	}

	sidebarClick()
	{
		var isActive = this.context.router.route.location.pathname;
		var activeClassName = "";
		var linkLocation = this.props.to;

		if (isActive == linkLocation) {
			activeClassName = 'nav-item active';
		} else {
			activeClassName = 'nav-item';
		}


		//console.log(this);
	}


	toggleSidebarClass = () => {
    const oldSidebarClassName = document.getElementById('sidebar-wrapper').className;
    const newSidebarClassName = oldSidebarClassName === 'my-sidebar sidebar-closed' ? 'my-sidebar sidebar-open' : 'my-sidebar sidebar-closed'

		const oldPageWrapperClassName = document.getElementById('page-content-wrapper').className;
		const newPageWrapperClassName = oldPageWrapperClassName === 'sidebar-closed' ? 'sidebar-open' : 'sidebar-closed'

    document.getElementById('sidebar-wrapper').className = newSidebarClassName;
		document.getElementById('page-content-wrapper').className = newPageWrapperClassName;
  }



	render() {
		

		let user =
			<div>
				<div className="user-status-icon">
					<i className="fas fa-plug"></i>
				</div>
				<p className="mt-3 small connection"><span className="toggleHidden">Ethereum network not connected. Please connect with Meta Mask.</span></p>
			</div>
		;

		if (this.props.connection === true && this.props.account.length !== 0) {
			console.log(this.props.account)
			user =
				<div>
					<div className="user-status-icon">
						<a href="/"><img src={makeBlockie(this.props.account)} alt={this.props.account} /></a>
					</div>
					{/* {this.props.account} */}
				</div>
			;


		}
		if(this.props.account.length === 0)

		 return (
			<div id="sidebar-wrapper" className="my-sidebar sidebar-closed">
				<div className="hamburgerNav" onClick={this.toggleSidebarClass}>
					<i className="fa fa-bars"></i>
				</div>
				<div className="user-status mt-5">
					{user}
				</div>
				<div className="menu mt-5">
					<h5 className="toggleHidden">Events & Tickets</h5>
					<ul className="nav flex-column">
						<li>
							<NavLink to="/findevents/1" className="nav-link" activeClassName="nav-link-active" onClick={() => {this.sidebarClick(this)}}><i className="fa fa-search"></i> <span className="toggleHidden">Events</span></NavLink>
						</li>
						<li>
							<NavLink to="/pastevents/1" className="nav-link" activeClassName="nav-link-active" onClick={() => {this.sidebarClick(this)}}><i className="fa fa-archive"></i> <span className="toggleHidden">Past Events</span></NavLink>
						</li>
						<li>
							<NavLink to="/topics" className="nav-link" activeClassName="nav-link-active" onClick={() => {this.sidebarClick(this)}}><i className="fa fa-comment-alt"></i> <span className="toggleHidden">Topics</span></NavLink>
						</li>
						<li>
							<NavLink to="/locations" className="nav-link" activeClassName="nav-link-active" onClick={() => {this.sidebarClick(this)}}><i className="fa fa-map-marker-alt"></i> <span className="toggleHidden">Locations</span></NavLink>
						</li>
						<li>
							<NavLink to="/Calendar" className="nav-link" activeClassName="nav-link-active"><i className="fa fa-calendar-alt"></i> <span className="toggleHidden">Calendar</span></NavLink>
						</li>
						
					</ul>
					<h5 className="mt-5 toggleHidden">Manage Events</h5>
					<ul className="nav flex-column">
						<li>
							<NavLink to="/createevent" className="nav-link" activeClassName="nav-link-active" onClick={() => {this.sidebarClick(this)}}><i className="fa fa-edit"></i> <span className="toggleHidden">Create Event</span></NavLink>
						</li>

					</ul>
					<h5 className="mt-5 toggleHidden">Tools</h5>
					<ul className="nav flex-column">
						<li>
							<NavLink to="/how-it-works" className="nav-link" activeClassName="nav-link-active" onClick={() => {this.sidebarClick(this)}}><i className="fa fa-question-circle"></i> <span className="toggleHidden">How It Works</span></NavLink>
						</li>
						<li >
							<div className="nav-link" onClick={() => {this.props.connect()}}><i className="fas fa-plug"></i> <span className="toggleHidden">Connect Wallet</span></div>
						</li>
					</ul>
					
					<br />
					<br /><br />
					<a aria-label="Homepage" target ="blank" title="GitHub" className="github footer-octicon d-none d-lg-block mx-lg-4" href="https://github.com/mitdralla/events-dapp">
      			<svg height="32" className="octicon octicon-mark-github" viewBox="0 0 16 16" version="1.1" width="32" aria-hidden="true"><path fill="#fff" fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
					</a>
				</div>
			</div>

		)

		else return (
			<div id="sidebar-wrapper" className="my-sidebar sidebar-closed">
				<div className="hamburgerNav" onClick={this.toggleSidebarClass}>
					<i className="fa fa-bars"></i>
				</div>
				<div className="user-status mt-5">
					{user}
				</div>
				<div className="menu mt-5">
					<h5 className="toggleHidden">Events & Tickets</h5>
					<ul className="nav flex-column">
						<li>
							<NavLink to="/findevents/1" className="nav-link" activeClassName="nav-link-active" onClick={() => {this.sidebarClick(this)}}><i className="fa fa-search" title="Find Events"></i> <span className="toggleHidden">Events</span></NavLink>
						</li>

						<li>
							<NavLink to="/pastevents/1" className="nav-link" activeClassName="nav-link-active" onClick={() => {this.sidebarClick(this)}}><i className="fa fa-archive" title="Past Events"></i> <span className="toggleHidden">Past Events</span></NavLink>
						</li>
						<li>
							<NavLink to="/topics" className="nav-link" activeClassName="nav-link-active" onClick={() => {this.sidebarClick(this)}}><i className="fa fa-comment-alt" title="Topics"></i> <span className="toggleHidden">Topics</span></NavLink>
						</li>
						<li>
							<NavLink to="/locations" className="nav-link" activeClassName="nav-link-active" onClick={() => {this.sidebarClick(this)}}><i className="fa fa-map-marker-alt" title="Locations"></i> <span className="toggleHidden">Locations</span></NavLink>
						</li>
						<li>
							<NavLink to="/Calendar" className="nav-link" activeClassName="nav-link-active"><i className="fa fa-calendar-alt" title="Calendar"></i> <span className="toggleHidden">Calendar</span></NavLink>
						</li>
						
					</ul>
					<h5 className="mt-5 toggleHidden">Manage Events</h5>
					<ul className="nav flex-column">

						<li>
							<NavLink to="/dashboard" className="nav-link" activeClassName="nav-link-active" ><i class="fas fa-tachometer-alt" title="Dashboard"></i> <span className="toggleHidden">Dashboard</span></NavLink>
						</li>
						
						<li>
							<NavLink to="/createevent" className="nav-link" activeClassName="nav-link-active" onClick={() => {this.sidebarClick(this)}}><i className="fa fa-edit" title="Create Event"></i> <span className="toggleHidden">Create Event</span></NavLink>
						</li>
						<li >
							<NavLink to="/myevents/1" className="nav-link" activeClassName="nav-link-active" onClick={() => {this.sidebarClick(this)}}><i class="fas fa-list-alt" title="My Created Events"></i> <span className="toggleHidden">My Created Events</span></NavLink>
						</li>
						<li>
							<NavLink to="/mytickets/1" className="nav-link" activeClassName="nav-link-active" onClick={() => {this.sidebarClick(this)}}><i className="fa fa-ticket-alt" title="My Tickets"></i> <span className="toggleHidden">My Tickets</span></NavLink>
						</li>
						
					</ul>
					<h5 className="mt-5 toggleHidden">Tools</h5>
					<ul className="nav flex-column">
						<li>
							<NavLink to="/how-it-works" className="nav-link" activeClassName="nav-link-active" onClick={() => {this.sidebarClick(this)}}><i className="fa fa-question-circle" title="How It Works"></i> <span className="toggleHidden">How It Works</span></NavLink>
						</li>
						<li className="nav-item">
							<NavLink to="/token" className="nav-link" activeClassName="nav-link-active"><img src="/images/hydro.png" className="sidebar_hydro-logo" alt="Hydro Token Logo" title="Hydro Faucet"/> <span className="toggleHidden">Get Hydro Tokens</span></NavLink>
						</li>
					</ul>
					<br />
					<br />
					<a aria-label="Homepage" target ="blank"title="GitHub" className="github footer-octicon d-none d-lg-block mx-lg-4 mt-3" href="https://github.com/mitdralla/events-dapp" >
      			<svg height="32" className="octicon octicon-mark-github" viewBox="0 0 16 16" version="1.1" width="32" aria-hidden="true"><path fill="#fff" fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
					</a>
				</div>
			</div>
		);
		
	}
}

Sidebar.contextTypes = {
    router: PropTypes.object
};

export default Sidebar;
