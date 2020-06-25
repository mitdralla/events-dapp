import React, { Component } from 'react';
import { drizzleConnect } from "drizzle-react";
import PropTypes from 'prop-types';
import makeBlockie from 'ethereum-blockies-base64';

import ipfs from '../utils/ipfs';
import Web3 from 'web3';

import Loading from './Loading';
import EventNotFound from './EventNotFound';
import Clock from './Clock';
import { Bar, Doughnut, Chart } from 'react-chartjs-2';
import JwPagination from 'jw-react-pagination';

import CheckUser from './CheckUser';
import {Open_events_ABI, Open_events_Address} from '../config/OpenEvents';
import {PhoenixDAO_Testnet_Token_ABI, PhoenixDAO_Testnet_Token_Address} from '../config/phoenixDAOcontract_testnet';

//Numerical Setting
let numeral = require('numeral');
//QR Code
let QRCode = require('qrcode.react');

//Dougnut Chart Percentage
var originalDoughnutDraw = Chart.controllers.doughnut.prototype.draw;
Chart.helpers.extend(Chart.controllers.doughnut.prototype, {
  draw: function() {
    originalDoughnutDraw.apply(this, arguments);

    var chart = this.chart;
    var width = chart.chart.width,
        height = chart.chart.height,
        ctx = chart.chart.ctx;

    var fontSize = 0.8
    ctx.font = fontSize + "em sans-serif";
    ctx.textBaseline = "middle";

	var percentage = 0;
	var total = chart.config.data.datasets[0].data[0] + chart.config.data.datasets[0].data[1]
	percentage = numeral(chart.config.data.datasets[0].data[0] *100/total).format('0.00')

	if(chart.config.data.datasets[0].data[1] == -1){
	var text = 'N/A',
	textX = Math.round((width - ctx.measureText(text).width) / 2),
	textY = height / 2.3;
	}

	else{
	var text = percentage+'%',
        textX = Math.round((width - ctx.measureText(text).width) / 2),
		textY = height / 2.3;
	}
    ctx.fillText(text, textX, textY);
  }
});

//Pagination Style
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

class MyEventStat extends Component {

    constructor(props, context) {
		try {
			var contractConfig = {
			  contractName: 'PHNX',
			  web3Contract: new context.drizzle.web3.eth.Contract(
				PhoenixDAO_Testnet_Token_ABI,
				PhoenixDAO_Testnet_Token_Address,
			  ),

			};
			context.drizzle.addContract(contractConfig);

		  } catch (e) {
			//console.log("ERROR", PhoenixDAO_Testnet_Token_Address, e);
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
			  phoenixDAO_market:[],

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
    this.setState({phoenixDAOTransfer:[]});}

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

  //get market cap & dollar value of PhoenixDAO
  async getPhoenixDAOMarketValue(){

	fetch('https://api.coingecko.com/api/v3/simple/price?ids=PHNX&vs_currencies=usd&include_market_cap=true&include_24hr_change=ture&include_last_updated_at=ture')
		  .then(res => res.json())
		  .then((data) => {
			if (this._isMounted){
			this.setState({phoenixDAO_market: data.PHNX })}
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
			approve:this.contracts['PHNX'].methods.approve(this.contracts['OpenEvents'].address, this.props.contracts['OpenEvents'].getEvent[this.event].value[2])
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

	//Pagination Change Page
	onChangePage(pageTransactions) {
		this.setState({ pageTransactions });
		}

		render() {
		let body = <Loading />;

		if (typeof this.props.contracts['OpenEvents'].getEvent[this.event] !== 'undefined') {
			if (this.props.contracts['OpenEvents'].getEvent[this.event].error) {
				body = <div className="text-center mt-5"><span role="img" aria-label="unicorn">🦄</span> PhoenixDAO Event not found</div>;
			} else {

				let event_data = this.props.contracts['OpenEvents'].getEvent[this.event].value;
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
					sold = false;
				}

				let current_revenue = price * event_data[6]

				let unsold_revenue = numeral(price * (max_seats - event_data[6])).format('0,0.00');

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
				let titleURL = "https://rinkeby.phoenixevents.io/events/" + pagetitle +"/" + this.props.match.params.id;
				//let titleURL = "https://rinkeby.phoenixevents.io/event/" + this.props.match.params.id;
				console.log(titleURL)

		if (this.props.accounts[0] !== event_data[9]){
			body = <div className="mt-5 text-center">
			<h3 className="mt-5">Access Denied!</h3>
			<p className="emoji"><span role="img" aria-label="sweat">😓</span></p>
			<p>You do not have access to this page.</p>
			<p>If you are the owner of this event & wish to view the page, please sign in with <b>Metamask</b>.</p>
			</div>
		}

		else if(this.props.match.params.page === pagetitle){
			// Doughnut Chart Data
			this.data = (canvas) => {
				const ctx = canvas.getContext("2d")
				const gradient = ctx.createLinearGradient(100,180,100,100,200);
				gradient.addColorStop(1, 'white');
				gradient.addColorStop(0, 'black');

				const gradient2 = ctx.createLinearGradient(100,120,100,100,200);
				gradient2.addColorStop(1, 'rgb(104, 160, 206)');
				gradient2.addColorStop(0, 'rgb(100, 101, 102)');

				return {
					labels: ['Current Revenue','Unsold Tickets'],
					datasets: [{
						label:'PHNX',
						fontColor:'black',
						backgroundColor: [gradient2,gradient,gradient],
						borderColor: 'rgb(228, 83, 138)',
						borderWidth: .8,
						hoverBackgroundColor: [gradient2,gradient],
						hoverBorderColor: 'pink',
						hoverBorderWidth:1,
						weight:5,
						borderAlign:'center',
						data: [price * event_data[6],price * (max_seats - event_data[6])],
						}],
					  }
					}


				body =
						<div className="row">
						<div className="col-12">
            			<h3>{event_data[0]}</h3>
            			<br />
           				{description}
            			<button className="btn btn-dark" onClick={this.inquire} disabled={disabled}><i className="fas fa-ticket-alt"></i>{buttonText}</button>
            			<label className="pl-2 small">{disabledStatus}</label>
            			<br/>
            			<br/>
           				<br/>

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
							{event_data[3]?numeral(price * this.state.phoenixDAO_market.usd).format('0,0.00'):''}</li>
						<li className="list-group-item">{date.toLocaleDateString()} at {date.toLocaleTimeString()}</li>
						<li className="list-group-item">Tickets: {event_data[6]}/{max_seats}</li>
						</ul>
						</div>

						{this._isMounted && <Clock deadline = {date} event_unix = {event_data[1]}/>}

						<div className="new-transaction-wrapper"><h4 className="transactions">Ticket Purchases</h4>
  						{this.state.load &&<Loading/>}
  						{this.state.pageTransactions.map((sold,index)=>(<p className="sold_text col-md-12" key={index}>
							  <img className="float-left blockie" src={makeBlockie(sold.returnValues.buyer)} />
							  <a href={"https://rinkeby.etherscan.io/address/"+sold.returnValues.buyer} target ="blank">
								  {sold.returnValues.buyer.slice(0,10)+'...'}</a> has <a href={"https://rinkeby.etherscan.io/tx/"+sold.transactionHash} target ="blank">bought</a> 1 ticket for <strong>{event_data[0]}</strong>.</p>))}
  						{!sold &&  <p className="sold_text col-md-12 no-tickets">There are currently no purchases for this ticket.</p>}
  						</div>

						<div className="pagination">
						<JwPagination items={this.state.soldTicket} onChangePage={this.onChangePage} maxPages={5} pageSize={5} styles={customStyles} />
						</div>

						<div className="new-transaction-wrapper"><h4 className="transactions"><i className="fas fa-ticket-alt"></i> Ticket Sales Info</h4>
  						{this.state.load &&<Loading/>}
						  <div className="sold_text col-12">

						  	<p className="myQR text-center col-md-3">
							  <QRCode value={titleURL}
							  size={128}
							  bgColor="transparent"
							  fgColor="black"
							  level={"H"}
							  imageSettings = {{
								  src:'/images/hydro.png',
								  height:34,
								  width:34,
								  x: null,
    							  y:53,
    							  excavate: false,
							  }}/>
							<p>Event QR-Code</p>
							</p>

							<p className="col-md-8">Tickets Sold: {event_data[6]} Tickets
						 	</p>

							{event_data[4]? <p className="col-md-8">Available Tickets: {max_seats - event_data[6]} Tickets
							</p>:<p className="col-md-12">Available Tickets: Unlimited</p>}


							{event_data[4]? <p className="col-md-8">Total Tickets For Sale: {event_data[4] ? max_seats:'Unlimited'} Tickets
							</p>:<p className="col-md-12">Total Tickets For Sale: Unlimited</p>}

						  </div>
						  </div>

						<div className="new-transaction-wrapper">
							<h4 className="sales"><i className="fas fa-hand-holding-usd"></i> Ticket Revenue </h4>

						<div className="sold_text col-12">
						<div className="chart col-md-3">
						<Doughnut data={this.data}
    						options={{

							responsive:true,
							maintainAspectRatio:false,
							cutoutPercentage: 62,

        					title:{
       						display: true,
        					position:"bottom",
       						text: 'PHNX Revenue',
        					fontSize: 16,
        					lineHeight:1.5,
        					padding:1.6,
							fontColor:'white',
							 },
							legend: {
								display:false,
								labels: {
									fontColor: 'white',
									fontSize:11
								},
							tooltips: {
           						enabled: true
        						},
							}
    					}}/>


						</div>
						 	<p className="col-md-8">Price Per Ticket: <img src={'/images/'+symbol} className="event_price-image2"  alt="Event Price" /> {event_data[3]? numeral(price).format('0,0'):'Free'}
							{event_data[3] ? ' or ':''}
							{event_data[3]? <img src={'/images/dollarsign.png'} className="event_price-image2"  alt="Event Price" />:''}
							{event_data[3]?numeral(price * this.state.phoenixDAO_market.usd).format('0,0.00'):''}
						 	</p>

							<p className="col-md-8">Current Revenue For Sold Tickets: <img src={'/images/'+symbol} className="event_price-image2"  alt="Event Price" /> {event_data[3]? numeral(price * event_data[6]).format('0,0'):(price * event_data[6])}
							{event_data[3] ? ' or ':''}
							{event_data[3]? <img src={'/images/dollarsign.png'} className="event_price-image2"  alt="Event Price" />:''}
							{event_data[3]?numeral(price * event_data[6] * this.state.phoenixDAO_market.usd).format('0,0.00'):''}
						 	</p>

							{event_data[4]? <p className="col-md-8">Expected Revenue For Remaining Tickets: <img src={'/images/'+symbol} className="event_price-image2"  alt="Event Price" /> {event_data[3]? numeral(price * (max_seats - event_data[6])).format('0,0'):price * (max_seats - event_data[6])}
							{event_data[3] ? ' or ':''}
							{event_data[3]? <img src={'/images/dollarsign.png'} className="event_price-image2"  alt="Event Price" />:''}
							{event_data[3]?numeral(price * (max_seats - event_data[6]) * this.state.phoenixDAO_market.usd).format('0,0.00'):''}
							</p>:<p className="col-md-12">Expected Revenue For Remaining Tickets: Unlimited</p>}


							{event_data[4]? <p className="col-md-8">Expected Revenue For Sold Out Event: <img src={'/images/'+symbol} className="event_price-image2"  alt="Event Price" /> {event_data[3]? numeral(price * max_seats).format('0,0'):price * max_seats}
							{event_data[3] ? ' or ':''}
							{event_data[3]? <img src={'/images/dollarsign.png'} className="event_price-image2"  alt="Event Price" />:''}
							{event_data[3]?numeral(price * max_seats * this.state.phoenixDAO_market.usd).format('0,0.00'):''}
							</p>:<p className="col-md-12">Expected Revenue For Sold Out Event: Unlimited</p>}

						  </div>
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
			<div>
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
		this.getPhoenixDAOMarketValue();
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

MyEventStat.contextTypes = {
    drizzle: PropTypes.object
}

const mapStateToProps = state => {
    return {
		contracts: state.contracts,
		accounts: state.accounts,
		transactionStack: state.transactionStack
    };
};

const AppContainer = drizzleConnect(MyEventStat, mapStateToProps);
export default AppContainer;
