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
import Event from './Event';
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
import NotifySuccess from './NotifySuccess';
import NotifyEventSuccess from './NotifyEventSuccess';
import NotifyApproveSuccess from './NotifyApproveSuccess';
import NotifySuccessFaucet from './NotifySuccessFaucet';
import NotifyError from './NotifyError';


import NetworkError from './NetworkError';
import LoadingApp from './LoadingApp';

let ethereum= window.ethereum;
let web3=window.web3;

class App extends Component
{

	constructor(props) {
		super(props);
		this.state = {
			sent_tx: [],
			showSidebar: true,
			account:[],
			
			
			id:'',
			fee:'',
			token:'',
			openEvents_Address:'',
			buyticket:'',
			approve:'',

			createEvent:'',
			upload:false,
			done:false,
			error:false,

			getHydro:'',
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
					autoClose: false,
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
	
	

//Get Account	
async loadBlockchainData() { 

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

	const accounts = await web3.eth.getAccounts();
    this.setState({account: accounts[0]});
	
	}
	
	//get value from buyer/from child components
	inquireBuy = (id,fee,token,openEvents_address,buyticket,approve)=>{
		this.setState({
			fee:fee,
			token:token,
			buyticket:buyticket,
			approve:approve
		},()=>this.buy())	 
	}

	//TransferFrom when buying with Hydro
	//After Approval
	afterApprove = () => setTimeout(()=>{
		let txreceiptApproved='';
		let txconfirmedApproved = '';
		let txerror = '';

		this.state.buyticket.send({from:this.state.account})
		.on('transactionHash',(hash)=>{
			if(hash !==null){
				toast(<Notify hash={hash} />, {
					position: "bottom-right",
					autoClose: false,
					pauseOnHover: true
					
				})
			}
		})
		.on('confirmation',(confirmationNumber, receipt)=>{
			if(confirmationNumber !== null){
			 txreceiptApproved = receipt
			 txconfirmedApproved = confirmationNumber
			if (txconfirmedApproved == 0 && txreceiptApproved.status == true){
				toast(<NotifySuccess hash={txreceiptApproved.transactionHash} />, {
						position: "bottom-right",
						autoClose: false,
						pauseOnHover: true	
					})
				}
			 	
			} 
	   	})
	   .on('error',(error)=>{
		if(error !== null){
			txerror = error
		   		toast(<NotifyError message={txerror.message} />, {
					position: "bottom-right",
					autoClose: false,
					pauseOnHover: true	
					})
			   	} 
	  	  	})
		},3000)
	
	//Buy Function, Notify listen for transaction status.
	buy = () =>{
		let txreceipt='';
		let txconfirmed = '';
		let txerror = '';
	
		if(this.state.token){
		this.state.approve.send({from:this.state.account})

		.on('transactionHash',(hash)=>{
			if(hash !==null){
				toast(<Notify hash={hash} />, {
					position: "bottom-right",
					autoClose: false,
					pauseOnHover: true
					
				})
			}
		})
		.on('confirmation',(confirmationNumber, receipt)=>{
			if(confirmationNumber !== null){
			 txreceipt = receipt
			 txconfirmed = confirmationNumber
			if (txconfirmed == 0 && txreceipt.status == true){
				toast(<NotifyApproveSuccess hash={txreceipt.transactionHash} />, 
					{
					position: "bottom-right",
					autoClose: false,
					pauseOnHover: true	
					})
				}
			 	
			} 
	   	})
	   .on('error',(error)=>{
		if(error !== null){
			txerror = error
		   		toast(<NotifyError message={txerror.message} />, 
				{
				position: "bottom-right",
				autoClose: false,
				pauseOnHover: true	
				})
			   } 
	  	  	})
		this.afterApprove()
	}
		
		else{
		this.state.buyticket.send({value:this.state.fee, from:this.state.account})

		.on('transactionHash',(hash)=>{
			if(hash !==null){
				toast(<Notify hash={hash} />, {
					position: "bottom-right",
					autoClose: false,
					pauseOnHover: true
					
				})
			}
		})
		.on('confirmation',(confirmationNumber, receipt)=>{
			if(confirmationNumber !== null){
			txreceipt = receipt
			txconfirmed = confirmationNumber
			if (txconfirmed == 0 && txreceipt.status == true){
				toast(<NotifySuccess hash={txreceipt.transactionHash} />, 
					{
					position: "bottom-right",
					autoClose: false,
					pauseOnHover: true	
					})
				}
			 	
			} 
	   	})
	   	.on('error',(error)=>{
		 	if(error !== null){
			txerror = error
		   		toast(<NotifyError message={txerror.message} />, 
				{
					position: "bottom-right",
					autoClose: false,
					pauseOnHover: true	
					})
			   	} 
	  	  	})
	    }
	}

	//Get Value form Event Creator from child component
	//Notify,listen for transaction status.
	passtransaction=(transaction)=>{
		let txreceipt='';
		let txconfirmed = '';
		let txerror = '';

		this.setState({upload:true,createEvent:transaction},()=>
		this.state.createEvent.send({from:this.state.account})
	
		.on('transactionHash',(hash)=>{
			if(hash !==null){
				this.setState({
					upload:false,
					done:true
				});
				toast(<Notify hash={hash} />, {
					position: "bottom-right",
					autoClose: false,
					pauseOnHover: true
					
				})
				
			}
		})
		.on('confirmation',(confirmationNumber, receipt)=>{
			if(confirmationNumber !== null){
			 txreceipt = receipt
			 txconfirmed = confirmationNumber
			 if (txconfirmed == 0 && txreceipt.status == true ){
				toast(<NotifyEventSuccess hash={txreceipt.transactionHash} 
					createdEvent = {txreceipt.events.CreatedEvent.returnValues} />, 
					{
					position: "bottom-right",
					autoClose: false,
					pauseOnHover: true	
					})
				}	
			} 
		})
		.on('error',(error)=>{
			if(error !== null){
			   txerror = error
			   this.setState({error:true})
				toast(<NotifyError message={txerror.message} />, 
				   {
				   position: "bottom-right",
				   autoClose: false,
				   pauseOnHover: true	
				   })
				} 
			})	
		)	
		
	}


	getHydro=(getHydro)=>{
		let txreceipt='';
		let txconfirmed = '';
		let txerror = '';

		this.setState({getHydro:getHydro},()=>
		this.state.getHydro.send({from:this.state.account})
	
		.on('transactionHash',(hash)=>{
			if(hash !==null){
				this.setState({
					upload:false,
					done:true
				});
				toast(<Notify hash={hash} />, {
					position: "bottom-right",
					autoClose: false,
					pauseOnHover: true
					
				})
				
			}
		})
		.on('confirmation',(confirmationNumber, receipt)=>{
			if(confirmationNumber !== null){

			 txreceipt = receipt
			 txconfirmed = confirmationNumber
			 
			 if (txconfirmed == 0 && txreceipt.status == true ){
				toast(<NotifySuccessFaucet hash={txreceipt.transactionHash}/>, 
					{
					position: "bottom-right",
					autoClose: false,
					pauseOnHover: true	
					})
				}	
			} 
		})
		.on('error',(error)=>{
			if(error !== null){
			   txerror = error
			   this.setState({error:true})
				toast(<NotifyError message={txerror.message} />, 
				   {
				   position: "bottom-right",
				   autoClose: false,
				   pauseOnHover: true	
				   })
				} 
			})	
		)	
		
	}

	render() {
		
		let body;
		let connecting = false;

		var items = ['slide1.png', 'slide2.png', 'slide3.png', 'slide4.png'];
    	var randomBG = items[Math.floor(Math.random()*items.length)];

		// console.log(randomBG);

		if (!this.props.drizzleStatus.initialized) {

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
					<Route exact path="/" render={props => <FindEvents  {...props} inquire = {this.inquireBuy}/>} />
					<Route path="/findevents/:page"  render={props => <FindEvents  {...props} inquire = {this.inquireBuy}/>}  />
					<Route path="/pastevents/:page" component={PastEvents} />
					<Route path="/mytickets/:page" component={MyTickets} />

					<Route path="/createevent" render={props=><CreateEvent  {...props} 
					passtransaction = {this.passtransaction}
					upload={this.state.upload} 
					done = {this.state.done}
					error = {this.state.error}/>}/> 

					<Route path="/myevents/:page"  render={props => <MyEvents {...props} inquire = {this.inquireBuy}/>}/>
					<Route path="/event/:id"  render={props => <EventPage {...props} inquire = {this.inquireBuy}/>}/>
					<Route path="/token" render={props => <Token {...props} getHydro = {this.getHydro}/>}/>
					<Route path="/topics" component={TopicsLandingPage} />
					<Route path="/topic/:page/:id" render={props => <TopicLandingPage {...props} inquire = {this.inquireBuy}/>}/> 
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
