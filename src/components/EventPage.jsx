import React, { Component } from 'react';
import { drizzleConnect } from "drizzle-react";
import PropTypes from 'prop-types';
import makeBlockie from 'ethereum-blockies-base64';

import ipfs from '../utils/ipfs';
import Web3 from 'web3';


import Loading from './Loading';
import EventNotFound from './EventNotFound';
import Clock from './Clock';
import JwPagination from 'jw-react-pagination';
import { Link } from 'react-router-dom';

import CheckUser from './CheckUser';
import {Open_events_ABI, Open_events_Address} from '../config/OpenEvents';
import {Hydro_Testnet_Token_ABI, Hydro_Testnet_Token_Address} from '../config/hydrocontract_testnet';

let numeral = require('numeral');

const customStyles = {
    ul: {
		border:'rgb(10, 53, 88)'
        
    },
    li: {
		border:'rgb(10, 53, 88)'
       
    },
    a: {
		color: '#007bff',
		
	},
	
};

class EventPage extends Component {

    constructor(props, context) {
		try {
			var contractConfig = {
			  contractName: 'Hydro',
			  web3Contract: new context.drizzle.web3.eth.Contract(
				Hydro_Testnet_Token_ABI,
				Hydro_Testnet_Token_Address,
			  ),

			};
			context.drizzle.addContract(contractConfig);
			//Importing Hydro/OMG contracts
			// **** ENDS UP HERE, SO THIS WORKS
			/*console.log(
			  "SUCCESS",
			  Hydro_Testnet_Token_Address,
			  context.drizzle.contracts
			);*/
		  } catch (e) {
			//console.log("ERROR", Hydro_Testnet_Token_Address, e);
		  }
      super(props);
		  this.contracts = context.drizzle.contracts;
		  this.event = this.contracts['OpenEvents'].methods.getEvent.cacheCall(this.props.match.params.id);
		  this.account = this.props.accounts[0];
		  this.state = {
			  load:true,
			  loading: false,
			  loaded: false,
			  description: null,
			  image: null,
			  ipfs_problem: false,

			  soldTicket:[],
			  latestblocks:5000000,
			  hydro_market:[],

			  fee:'',
			  token:'',
			  openEvents_address:'',
			  buyticket:'',
			  approve:'',
			  pageTransactions:[],

		  };
		  this.isCancelled = false;
		  this.onChangePage = this.onChangePage.bind(this);
	}

	//Get SoldTicket Data
	async loadblockhain(){

	const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws/v3/72e114745bbf4822b987489c119f858b'));
	const openEvents =  new web3.eth.Contract(Open_events_ABI, Open_events_Address);

    if (this._isMounted){
    this.setState({openEvents});
    this.setState({hydroTransfer:[]});}

    const blockNumber = await web3.eth.getBlockNumber();
    if (this._isMounted){
    this.setState({
		blocks:blockNumber - 50000,
	    latestblocks:blockNumber - 1,
		soldTicket:[]
		});
	}

    openEvents.getPastEvents("SoldTicket",{filter:{eventId:this.props.match.params.id},fromBlock: 5000000, toBlock:this.state.latestblocks})
    .then(events=>{

    this.setState({load:true})
    var newest = events;
    var newsort= newest.concat().sort((a,b)=> b.blockNumber- a.blockNumber);
    if (this._isMounted){
    this.setState({soldTicket:newsort,check:newsort});
    this.setState({load:false})
    this.setState({active_length:this.state.soldTicket.length});

  	}
    }).catch((err)=>console.error(err))

	//Listen for Incoming Sold Tickets
    openEvents.events.SoldTicket({filter:{eventId:this.props.match.params.id},fromBlock: blockNumber, toBlock:'latest'})
  	.on('data', (log) =>setTimeout(()=> {
    this.setState({load:true});

    this.setState({soldTicket:[...this.state.soldTicket,log]});
    var newest = this.state.soldTicket
    var newsort= newest.concat().sort((a,b)=> b.blockNumber- a.blockNumber);
    if (this._isMounted){

    this.setState({soldTicket:newsort});
    this.setState({active_length:this.state.soldTicket.length})}
    this.setState({load:false});
    }),15000)
  }

  //get market cap & dollar value of hydro
  async getHydroMarketValue(){

	fetch('https://api.coingecko.com/api/v3/simple/price?ids=Hydro&vs_currencies=usd&include_market_cap=true&include_24hr_change=ture&include_last_updated_at=ture')
		  .then(res => res.json())
		  .then((data) => {
			if (this._isMounted){
			this.setState({hydro_market: data.hydro })}
		  })
		  .catch(console.log)
  }

	updateIPFS = () => {
		if (
			this.state.loaded === false &&
			this.state.loading === false &&
			typeof this.props.contracts['OpenEvents'].getEvent[this.event] !== 'undefined' &&
			!this.props.contracts['OpenEvents'].getEvent[this.event].error
		) {
			this.setState({
				loading: true
			}, () => {
				ipfs.get(this.props.contracts['OpenEvents'].getEvent[this.event].value[7]).then((file) => {
					let data = JSON.parse(file[0].content.toString());
					if (!this.isCancelled) {
						this.setState({
							loading: false,
							loaded: true,
							description: data.text,
							image: data.image,
              locations: data.location
						});
					}
				}).catch(() => {
					if (!this.isCancelled) {
						this.setState({
							loading: false,
							loaded: true,
							ipfs_problem: true
						});
					}
				});
			});
		}
	}

	getImage = () => {
		let image = '/images/loading_ipfs.png';
		if (this.state.ipfs_problem) image = '/images/problem_ipfs.png';
		if (this.state.image !== null) image = this.state.image;
		return image;
	}

	getDescription = () => {
		let description = <Loading />;
		if (this.state.ipfs_problem) description = <p><span role="img" aria-label="monkey">🙊</span>We can not load description</p>;
		if (this.state.description !== null) description = <p>{this.state.description}</p>;
		return description;
	}


	inquire = () =>{
		this.setState({
			fee:this.props.contracts['OpenEvents'].getEvent[this.event].value[2],
			token:this.props.contracts['OpenEvents'].getEvent[this.event].value[3],
			openEvents_address:this.contracts['OpenEvents'].address,
			buyticket:this.contracts['OpenEvents'].methods.buyTicket(this.props.match.params.id),
			approve:this.contracts['Hydro'].methods.approve(this.contracts['OpenEvents'].address, this.props.contracts['OpenEvents'].getEvent[this.event].value[2])
			},()=>{
				  this.props.inquire(
					  this.props.id,
					  this.state.fee,
					  this.state.token,
					  this.state.openEvents_address,
					  this.state.buyticket,
					  this.state.approve)
				})
			}

      getLocation = () => {
    		let locations = []
    		if (this.state.ipfs_problem) locations = <p className="text-center mb-0 event-description"><span role="img" aria-label="monkey">🙊</span>We can not load location</p>;
    		if (this.state.locations !== null) {
    			let place= this.state.locations
    			locations = <span>Location: {place}</span>;
    		}
    		return locations;
		}
		
		onChangePage(pageTransactions) {
			this.setState({ pageTransactions });
		}

		render() {
		let body = <Loading />;

		if (typeof this.props.contracts['OpenEvents'].getEvent[this.event] !== 'undefined') {
			if (this.props.contracts['OpenEvents'].getEvent[this.event].error) {
				body = <div className="text-center mt-5"><span role="img" aria-label="unicorn">🦄</span> Hydro Event not found</div>;
			} else {

				let event_data = this.props.contracts['OpenEvents'].getEvent[this.event].value;
        let event_tit
				let image = this.getImage();
				let description = this.getDescription();
				let locations = this.getLocation();
				let buttonText = event_data[3]? " Buy Ticket": " Get Ticket";

				let symbol = event_data[3] ? 'hydro.png' : 'hydro.png';
				let price = this.context.drizzle.web3.utils.fromWei(event_data[2]);
				let date = new Date(parseInt(event_data[1], 10) * 1000);

				let max_seats = event_data[4] ? event_data[5] : '∞';

				let disabled = false;
				let disabledStatus;
				let sold = true;

				if (event_data[4] && (Number(event_data[6]) >= Number(event_data[5]))) {
					disabled = true;
					disabledStatus = <span><span role="img" aria-label="alert">⚠️</span> No more tickets</span>;
					buttonText = " Sold Out"
				}


				if (date.getTime() < new Date().getTime()) {
					disabled = true;
					disabledStatus = <span><span role="img" aria-label="alert">⚠️</span> This event has already ended.</span>;
				}

				if(this.state.active_length <= 0){
					sold=false;
				}

				let myEvent = false;
				if(event_data[9] === this.account){
				 myEvent = true;
				}
		
        let rawCategory = event_data[8];

        var categoryRemovedDashes = rawCategory;
        categoryRemovedDashes = categoryRemovedDashes.replace(/-/g, ' ');

        var category = categoryRemovedDashes.toLowerCase()
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
		.join(' ');
		//Friendly URL Title
		let rawTitle = event_data[0];
      	var titleRemovedSpaces = rawTitle;
	  	titleRemovedSpaces = titleRemovedSpaces.replace(/ /g, '-');

      	var pagetitle = titleRemovedSpaces.toLowerCase()
      	.split(' ')
      	.map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      	.join(' ');

		if(this.props.match.params.page === pagetitle){
		 
				body =
					<div className="row">

						<div className="col-12">

            	<h3>{event_data[0]}</h3>
           		 <br />
           		 {description}
            	<button className="btn btn-dark" onClick={this.inquire} disabled={disabled}><i className="fas fa-ticket-alt"></i>{buttonText}</button>
            	<label className="pl-2 small">{disabledStatus}</label>

            	<br />
				{myEvent === true && <Link to ={"/event-stat/"+pagetitle+"/" + this.props.match.params.id}>
				<button className="btn btn-dark mt-2"><i className="fas fa-chart-bar"></i> View Event Stat</button>
				</Link>}
           		<br />
           	 	<br />

							<div className="card event-hero-sidebar">
								<img className="card-img-top event-image" src={image} alt="Event" />
								<div className="card-header event-header">
									<img className="float-left" src={makeBlockie(event_data[9])} alt="User Identicon" />
								</div>

                		<div className="card-body">
                  		<h5 className="card-title event-title">
                    	{event_data[0]}
                  		</h5>
      						{description}
      					</div>

								<ul className="list-group list-group-flush">
                  					<li className="list-group-item ">{locations}</li>
									<li className="list-group-item">Category: {category}</li>
									<li className="list-group-item">Price: <img src={'/images/'+symbol} className="event_price-image"  alt="Event Price" /> {event_data[3]? numeral(price).format('0,0'):'Free'} 
									{event_data[3] ? ' or ':''} 
									{event_data[3]? <img src={'/images/dollarsign.png'} className="event_price-image"  alt="Event Price" />:''} 
									{event_data[3]?numeral(price * this.state.hydro_market.usd).format('0,0.00'):''}</li>
									<li className="list-group-item">{date.toLocaleDateString()} at {date.toLocaleTimeString()}</li>
									<li className="list-group-item">Tickets: {event_data[6]}/{max_seats}</li>
								</ul>
							</div>
						{this._isMounted && <Clock deadline = {date} event_unix = {event_data[1]}/>}
              			<div className="new-transaction-wrapper"><h4 className="transactions">Ticket Purchases</h4> 
  						{this.state.load &&<Loading/>}
  						{this.state.pageTransactions.map((sold,index)=>(<p className="sold_text col-md-12" key={index}><img className="float-left blockie" src={makeBlockie(sold.returnValues.buyer)} /> Someone bought 1 ticket for <strong>{event_data[0]}</strong>.</p>))}
  						{!sold &&  <p className="sold_text col-md-12 no-tickets">There are currently no purchases for this ticket.</p>}
  						</div>

						<div className="pagination">
						<JwPagination items={this.state.soldTicket} onChangePage={this.onChangePage} maxPages={5} pageSize={5} styles={customStyles} />	
						</div>

						</div>

            <div className="col-12">
              <div className="mt-5">
              </div>
              <CheckUser event_id={this.props.match.params.id} />
              </div>
			<hr/>
			</div>;
				}
				
			else {
				body = <EventNotFound/>;
				}
			}
			
		}

		return (
			<div className="event-page-wrapper">
				<h2><i className="fa fa-calendar-alt"></i> Event</h2>
				<hr />
				{body}
				<hr/>
				

			</div>
		);
	}

	componentDidMount() {
		this._isMounted = true;
		this.updateIPFS();
		this.loadblockhain();
		this.getHydroMarketValue();
	}

	componentDidUpdate() {
		this.updateIPFS();
		//this.afterApprove();
	}

	componentWillUnmount() {
		this.isCancelled = true;
		this._isMounted = false;
	}
}

EventPage.contextTypes = {
    drizzle: PropTypes.object
}

const mapStateToProps = state => {
    return {
		contracts: state.contracts,
		accounts: state.accounts,
		transactionStack: state.transactionStack
    };
};

const AppContainer = drizzleConnect(EventPage, mapStateToProps);
export default AppContainer;
