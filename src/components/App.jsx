import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { drizzleConnect } from 'drizzle-react';
import { ToastContainer, toast } from 'react-toastify';
import Web3 from 'web3';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'startbootstrap-simple-sidebar/css/simple-sidebar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/main.css';

import Sidebar from './Sidebar';
import Home from './Home';
import FindEvents from './FindEvents';
import PastEvents from './PastEvents';
import MyTickets from './MyTickets';
import CreateEvent from './CreateEvent/';
import MyEvents from './MyEvents';
import EventPage from './EventPage';
import TopicLandingPage from './TopicLandingPage';
import TopicsLandingPage from './TopicsLandingPage';
import LocationLandingPage from './LocationLandingPage';
import LocationsLandingPage from './LocationsLandingPage';
import Token from './Token';
import Notify from './Notify';
import NetworkError from './NetworkError';
import LoadingApp from './LoadingApp';

class App extends Component
{

	constructor(props) {
		super(props);
		this.state = {
			sent_tx: [],
			showSidebar: true,
			account:[]
		};
	}

	componentDidMount(){
		this.loadBlockchainData();

	}

	componentWillUpdate() {
		let sent_tx = this.state.sent_tx;

		for (let i = 0; i < this.props.transactionStack.length; i++) {
			if (sent_tx.indexOf(this.props.transactionStack[i]) === -1) {
				sent_tx.push(this.props.transactionStack[i]);
				toast(<Notify hash={this.props.transactionStack[i]} />, {
					position: "bottom-right",
					autoClose: 10000,
					pauseOnHover: true
				});
			}
		}

		if (sent_tx.length !== this.state.sent_tx.length) {
			this.setState({
				sent_tx: sent_tx
			});
		}
	}

	
async loadBlockchainData() { 

	let ethereum= window.ethereum;
	let web3=window.web3;

 
	if(typeof ethereum !=='undefined'){
	// console.log("metamask")
	 await ethereum.enable();
	 web3 = new Web3(ethereum);
	
 	}
 
 	else if (typeof web3 !== 'undefined'){
	console.log('Web3 Detected!')
 	window.web3 = new Web3(web3.currentProvider);
	 }
	 
 	else{console.log('No Web3 Detected')
 	window.web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/72e114745bbf4822b987489c119f858b'));

	}

	window.ethereum.on('accountsChanged', function (accounts) {
 	window.location.reload();
	})

	window.ethereum.on('networkChanged', function (netId) {
 	window.location.reload();
	}) 
	}

	render() {
		
		let body;
		let connecting = false;

		var items = ['slide1.png', 'slide2.png', 'slide3.png', 'slide4.png'];
    	var randomBG = items[Math.floor(Math.random()*items.length)];

		// console.log(randomBG);

		if (!this.props.drizzleStatus.initialized) {

			console.log("account",this.props.accounts)
		
			body =
				<div>
					<Switch>
						<Route exact path="/" component={Home} />
						<Route component={LoadingApp} />
					</Switch>
				</div>
			;
			connecting = true;
		} else if (
			this.props.web3.status === 'failed' ||
			(this.props.web3.status === 'initialized' && Object.keys(this.props.accounts).length === 0) ||
			(process.env.NODE_ENV === 'production' && this.props.web3.networkId !== 4)
		) {
			
			console.log("account",this.props.accounts)

			body =
				<div>
					<Switch>
						<Route exact path="/" component={Home} />
						<Route component={NetworkError} />
					</Switch>
				</div>
			;
			connecting = true;
		} else {
			body =
				<div>
					<Route exact path="/" component={FindEvents} />
					<Route path="/findevents/:page" component={FindEvents} />
					<Route path="/pastevents/:page" component={PastEvents} />
					<Route path="/mytickets/:page" component={MyTickets} />
					<Route path="/createevent" component={CreateEvent} />
					<Route path="/myevents/:page" component={MyEvents} />
					<Route path="/event/:id" component={EventPage} />
					<Route path="/token" component={Token} />
					<Route path="/topics" component={TopicsLandingPage} />
					<Route path="/topic/:page/:id" component={TopicLandingPage} />
					<Route path="/locations" component={LocationsLandingPage} />
					<Route path="/location/:page" component={LocationLandingPage} />
					<Route path="/how-it-works" component={Home} />
				</div>
			;
		}

		return(
			<Router>
				<div id="wrapper" className="toggled">
					<Sidebar connection={!connecting} account={this.props.accounts[0]} />
					<div id="page-content-wrapper">
						<div id="bgImage" ref="bgImage" style={{
  						backgroundImage: "url(/images/slides/"+ randomBG + ")",
						}} />
						<div className="branding">
						<img src="/images/hydro.png" className="branding-logo" alt="hydro logo" /> 
						<h1>Hydro Events Marketplace</h1>
						<p>What are you going to do?</p>
						</div>
						<div className="container-fluid">
							<div className="page-wrapper-inner">
								<div>
									{body}
								</div>
							</div>
						</div>
					</div>
					<ToastContainer />
				</div>
			</Router>
		);
	}
}

const mapStateToProps = state => {
    return {
		drizzleStatus: state.drizzleStatus,
		web3: state.web3,
		accounts: state.accounts,
		transactionStack: state.transactionStack,
		transactions: state.transactions
    };
};

const AppContainer = drizzleConnect(App, mapStateToProps);
export default AppContainer;
