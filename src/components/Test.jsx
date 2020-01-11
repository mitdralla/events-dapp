import React,{Component} from 'react';
import { Link } from 'react-router-dom';
import makeBlockie from 'ethereum-blockies-base64';
import ipfs from '../utils/ipfs';
//import Center from 'react-center';
import {
    Nav,
    Container,
    Row,
    Col,
    Image,
} from 'react-bootstrap';

import Web3 from 'web3';
//import {HydroToken_ABI, HydroToken_Address} from '../blockchain-data/hydrocontract';
import {Open_events_ABI, Open_events_Address} from '../config/OpenEvents';
//import Moment from 'react-moment';
//import  './FaucetModal.css';



//let web3 = new Web3(new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws/v3/72e114745bbf4822b987489c119f858b'));
//let web2 = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws/v3/72e114745bbf4822b987489c119f858b'));

//let numeral = require('numeral');
let polltry = [];

export default class Test extends Component {

  _isMounted = false;
  //abortController = new AbortController()
  

  componentDidMount(){
      this._isMounted = true;
      this.loadSnowflake();
      this.loadmarket();
      this.updateIPFS();
      this.loadetherscan();

     }

     componentDidUpdate() {
     this.updateIPFS();
      //this.afterApprove();
        
    }
     

  async loadSnowflake(){
  const{mainnet} = this.state

  
  const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws/v3/72e114745bbf4822b987489c119f858b'));
  const snowSolidity =  new web3.eth.Contract(Open_events_ABI, Open_events_Address);
  
  if (this._isMounted){
  this.setState({snowSolidity});
  this.setState({hydroTransfer:[]});}

  const blockNumber = await web3.eth.getBlockNumber();
  if (this._isMounted){
  this.setState({blocks:blockNumber - 50000});
  this.setState({latestblocks:blockNumber});
  this.setState({hydroTransfer:[]});}

  snowSolidity.getPastEvents("CreatedEvent",{fromBlock: this.state.blocks, toBlock:'latest'})
  .then(events=>{

  var newest = events;
  var newsort= newest.concat().sort((a,b)=> b.blockNumber- a.blockNumber);
  if (this._isMounted){
  this.setState({hydroTransfer:newsort,check:newsort});
  this.setState({loading:false})
  this.setState({count:this.state.hydroTransfer.length});
  console.log('state',this.state.hydroTransfer)
  console.log('state',this.state.count)


 // event_list.push(this.props.contracts['OpenEvents'].methods.getEvent.cacheCall(i))

}

   
  }).catch((err)=>console.error(err))

  

  /*snowSolidity.events.CreatedEvent({toBlock:'latest'})
  .on('data', (log) => {
    
    //let { returnValues: {owner,eventId,name,category,ipfs},blockNumber } = log
    //let values = {owner,eventId,name,category,ipfs,blockNumber}
    //console.log(values)
    if (this._isMounted){
    this.setState({incoming:true});
    this.setState({loading:true});}

    if (this._isMounted && this.state.mainnet == true)setTimeout(()=>{
    this.setState({hydroTransfer:[...this.state.hydroTransfer,log]})   
    var newest = this.state.hydroTransfer;
    var newsort= newest.concat().sort((a,b)=> b.blockNumber- a.blockNumber);
    if (this._isMounted){
    this.setState({hydroTransfer:newsort});
    this.setState({loading:false});
    this.setState({incoming:false});
    this.setState({count:this.state.hydroTransfer.length})}
    console.log('state',this.state.hydroTransfer.name)
    console.log('state',this.state.count)
    },1000) 
  })

 
  for(var i = 12; i >=0; i--){
    const poll =   await snowSolidity.methods.getEvent(i).call();


   this.setState({
        polls: [...this.state.polls, i],
        isOldestFirst:true,
    })}
    console.log("polls:", this.state.polls)*/


}

async loadmarket(){

  fetch('https://api.coingecko.com/api/v3/simple/price?ids=Hydro&vs_currencies=usd&include_market_cap=true&include_24hr_change=ture&include_last_updated_at=ture')
        .then(res => res.json())
        .then((data) => {
          if (this._isMounted){
          this.setState({ marketcap: data.hydro })}
          
        })
        .catch(console.log)
}

 loadetherscan(){
  fetch ('https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=379224&toBlock=latest&address=0xebbdf302c940c6bfd49c6b165f457fdb324649bc&topic0=5472616e73666572a&apikey=ZPRBBU2E6Z4QMEXPI7BWMCMVK7I6XZ6ZXE')
.then(res => res.json())
.then((check)=>{
  if(this._isMounted){
this.setState({checktx:check})

  }
})

 }
  componentWillUnmount(){
   // this.abortController.abort()
    this._isMounted = false;}


  constructor(props){
    super(props)
    
    this.state = {
        snowSolidity:[],
        account:'',
        balance:'',
        details:'',
        loading:true,
        pageOfItems: [],
        search:'',
        hydroTransfer:[],
        contract:'',
        contractaccount:'',
        number:'',
        EIN:'',
        mainnet:true,
        marketcap:[],
        summaryModalShow: false,
        checktx:[],
        x:[],
        blocks:'',
        latestblocks:'',
        image:[],
        ipfs_problem:false,
        polls:'',
        loaded:false,
        loading:false,
        description:[],
        check:[],
        
    }
        //this.onChangePage = this.onChangePage.bind(this);
        this.updateSearch = this.updateSearch.bind(this);
  }


  updateIPFS = (make) => {

		if (this.state.loaded === false && this.state.loading === false ) {
			this.setState({
        loading: true,
        image:[],
        description:[],
			}, () => {
				  this.state.hydroTransfer.map((events)=>(ipfs.get(events.returnValues.ipfs).then((file) => {
					let data = JSON.parse(file[0].content.toString());
					if (!this.isCancelled) {
						this.setState({
							loading: false,
							loaded: true,
							description: [...this.state.description,data.text],
              image: [...this.state.image,data.image]
              
						},()=>console.log(this.state.description));
					}
				}).catch(() => {
					if (!this.isCancelled) {
						this.setState({
              image:[],
              description:[],
							loading: false,
							loaded: true,
							ipfs_problem: true
						});
					}
				})));
			});
      }
  }
  
  updateSearch=(e)=>{
    let {value} = e.target
    this.setState({value,loaded:false,loading:false},()=>{
     if(this.state.value !== ""){  
    var filteredEvents = this.state.check;
    filteredEvents = filteredEvents.filter((events)=>{

    return events.returnValues.name.toLowerCase().search(this.state.value.toLowerCase()) !==-1;
    })}else{ filteredEvents = this.state.check}

  this.setState({hydroTransfer:filteredEvents,
                 });

  }),()=>this.updateIPFS()}

  getImage = (index) => {
		let image = '/images/loading_ipfs.png';
		if (this.state.ipfs_problem) image = '/images/problem_ipfs.png';
    if (this.state.image !== null) image = this.state.image[index];
    
    return image;
    
	}
  

  render(){
  
  const{loading}=this.state
  const{incoming}=this.state
  let summaryModalClose =() =>this.setState({summaryModalShow:false});

  return (
   <div>
     <a id="moon"></a>
     {this.state.hydroTransfer.map((Events,index)=>(
       
     <div className="card">
    
					<Link to={"/event/" + Events.returnValues.eventId}>
            <img className="card-img-top event-image"  src={this.getImage(index)} alt={Events.returnValues.ipfs} />
          </Link>
					<div className="card-header text-muted event-header">
						<img className="float-left" src={makeBlockie(Events.returnValues.owner)} alt={Events.returnValues.owner} />
						<p className="small text-truncate mb-0">
							Creator: <a href={"https://rinkeby.etherscan.io/address/" + Events.owner} target="_blank" className="event_creator-link">
								{Events.owner}
							</a>
						</p>
					</div>
					<div className="card-body">
						<h5 className="card-title event-title">
							<Link to={"/event/" + Events.returnValues.eventId}>{Events.returnValues.name}</Link>
						</h5>
						{this.state.description[index+1]}
					</div>
					
				</div>))}





      <Container>
      <Col xs={2}><h4><input className="searchbar" value={this.state.value} placeholder='Search' onChange={this.updateSearch.bind(this)}/></h4></Col>
     
      <Row><Col><h1> </h1></Col></Row>
      <Row><Col><h1> </h1></Col></Row>
         
      
       
       
       <Row><Col><h1> </h1></Col></Row>
       <Row><Col><h1> </h1></Col></Row>
       
       
        

      
       
      <Row><Col><h1> </h1></Col></Row>

      <Row className ="row_underline2">
      <Col className= "col_border2" md={2}><h3>Amount</h3></Col>
      <Col className= "col_border2" md={2}><h3>Block</h3></Col>
      <Col className= "col_border2" md={4}><h3>To</h3></Col>
      <Col className="col_border2" md={4}><h3>From</h3></Col>
      
      
        </Row>
        
       
       <Row><Col><h1> </h1></Col></Row>
       <Row><Col><h1> </h1></Col></Row>
       <Row><Col><h1> </h1></Col></Row>
       <Row><Col><h1> </h1></Col></Row>
       <Row><Col><h1> </h1></Col></Row>

     </Container>
     <a href= "/Ethereum#moon" className="accountlink"> <button className="topButton">Top</button></a>
   </div>
  );
}
}