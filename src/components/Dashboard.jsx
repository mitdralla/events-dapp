import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Carousel from 'react-bootstrap/Carousel'

import Loading from './Loading';
import { Bar, Doughnut} from 'react-chartjs-2';

import topicsJson from '../config/topics.json';


let numeral = require('numeral');

class Dashboard extends Component {
  constructor(props, context) {
      super(props);
      this.state = {
         hydro_market:[],
         
    }
	    this.contracts = context.drizzle.contracts;
        this.events = this.contracts['OpenEvents'].methods.eventsOf.cacheCall(this.props.accounts[0]);
        
	    this.perPage = 6;
      this.topicClick = this.topicClick.bind(this);
	}

  topicClick(slug) {
    this.props.history.push("/topic/"+slug+"/"+1);
    window.scrollTo(0, 180);
  }

  caruselClick(location)
  {
    this.props.history.push(location);
    window.scrollTo(0, 80);
  }

  goTo = (id, name) =>{
    let rawTitle = name;
    var titleRemovedSpaces = rawTitle;
	  titleRemovedSpaces = titleRemovedSpaces.replace(/ /g, '-');

      var pagetitle = titleRemovedSpaces.toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');

	  let myEventStatURL = "/event-stat/"+pagetitle+"/" + id;
    this.props.history.push(myEventStatURL);
  }

  async getHydroMarketValue(){

		fetch('https://api.coingecko.com/api/v3/simple/price?ids=Hydro&vs_currencies=usd&include_market_cap=true&include_24hr_change=ture&include_last_updated_at=ture')
			  .then(res => res.json())
			  .then((data) => {
				if (this._isMounted){
				this.setState({hydro_market: data.hydro })}
			  })
			  .catch(console.log)
	  }
  

	render() {
        let body = '';
    
		if (typeof this.props.contracts['OpenEvents'].eventsOf[this.events] !== 'undefined') {

            let eventCount = this.props.contracts['OpenEvents'].eventsOf[this.events].value;
            let eventCache = [];
            let eventDetails = [];
            let check = [5,1,1];
 
            for(var i = 0; i < eventCount.length;i++){ 
              eventCache.push(this.contracts['OpenEvents'].methods.getEvent.cacheCall(eventCount[i]))
              if (typeof this.props.contracts['OpenEvents'].getEvent[eventCache[i]] !== 'undefined' && this.props.contracts['OpenEvents'].getEvent[eventCache[i]].value) {
                eventDetails.push({result:this.props.contracts['OpenEvents'].getEvent[eventCache[i]].value,id:eventCount[i]})
               
              } 
            }

            //console.log(eventDetails)
            let sortBySold= eventDetails.concat().sort((a,b)=> b.result.sold - a.result.sold);
            let hydroRevenue = eventDetails.filter((event_token)=>event_token.result.token == true)
            let limited = eventDetails.filter((event_seats)=>event_seats.result.limited == true)
            
            let top_hydroRevenue = hydroRevenue.concat().sort((a,b)=> 
            parseInt(b.result.sold * this.context.drizzle.web3.utils.fromWei(b.result.price)) -
            parseInt(a.result.sold * this.context.drizzle.web3.utils.fromWei(a.result.price)));
           
            let sortSold = [];
            let sortTopRevenue = [];
            let toplist = true;
            
            if(sortBySold.length <=0){
              toplist = false;
            }
           
            if(sortBySold.length > 5){
            for(var x = 0; x < 5; x++){
              sortSold.push(sortBySold[x])
            }
            }else{
              for(var x = 0; x < sortBySold.length; x++){
                sortSold.push(sortBySold[x])
              }
            };

            /*Get Top Hydro Revenue*/
          
            if(top_hydroRevenue.length > 5){
            for(var x = 0; x < 5; x++){
              sortTopRevenue.push(top_hydroRevenue[x])
            }
            }else{
              for(var x = 0; x < top_hydroRevenue.length; x++){
                sortTopRevenue.push(top_hydroRevenue[x])
              }
            }

            let totalSold = sortBySold.reduce((accumulator, currentValue)=>accumulator + parseInt(currentValue.result.sold),0)
            let revenue = hydroRevenue.reduce((accumulator, currentValue)=>accumulator + parseInt(currentValue.result.sold * this.context.drizzle.web3.utils.fromWei(currentValue.result.price)),0)
            let soldSeats = limited.reduce((accumulator, currentValue)=>accumulator + parseInt(currentValue.result.sold),0)
            let totalSeats = limited.reduce((accumulator, currentValue)=>accumulator + parseInt(currentValue.result.seats),0)
         
        // Doughnut Chart Data
		  	this.DoughnutData= (canvas) => {
				const ctx = canvas.getContext("2d")
				const gradient = ctx.createLinearGradient(100,180,100,100,200);
				gradient.addColorStop(1, 'white');
				gradient.addColorStop(0, 'black');

				const gradient2 = ctx.createLinearGradient(100,120,100,100,200);
				gradient2.addColorStop(1, 'rgb(104, 160, 206)');
				gradient2.addColorStop(0, 'rgb(100, 101, 102)');
				if(totalSeats !==0){
				return {
					labels: ['Sold Tickets','Unsold Tickets'],
					datasets: [{
						label:'Hydro',
						fontColor:'black',
						backgroundColor: [gradient2,gradient,gradient],
						borderColor: 'rgb(228, 83, 138)',
						borderWidth: .8,
						hoverBackgroundColor: [gradient2,gradient],
						hoverBorderColor: 'pink',
						hoverBorderWidth:1,
						weight:5,
						borderAlign:'center',
						data: [soldSeats, totalSeats - soldSeats],
						}],					
					  }	
					}
         else{
          return {
            labels: ['Sold Tickets','Unsold Tickets'],
            datasets: [{
              label:'Hydro',
              fontColor:'black',
              backgroundColor: [gradient2,gradient,gradient],
              borderColor: 'rgb(228, 83, 138)',
              borderWidth: .8,
              hoverBackgroundColor: [gradient2,gradient],
              hoverBorderColor: 'pink',
              hoverBorderWidth:1,
              weight:5,
              borderAlign:'center',
              data: [0,-1],
              }],					
              }	
           }
          }

          this.BarData = (canvas) => {
            const ctx = canvas.getContext("2d")
            const gradient = ctx.createLinearGradient(800,200,500,800,200);
            gradient.addColorStop(1, 'blue');
            gradient.addColorStop(0, 'white');
    
            const gradient2 = ctx.createLinearGradient(100,120,100,100,200);
            gradient2.addColorStop(1, 'rgb(104, 160, 206)');
            gradient2.addColorStop(0, 'rgb(100, 101, 102)');
            if(sortTopRevenue.length !==0){
            return {
              labels: sortTopRevenue.map(event=>[event.result.name]),
              datasets: [{
                label:'Hydro',
                fontColor:'black',
                backgroundColor: [gradient,gradient,gradient,gradient,gradient],
                borderColor: 'white',
                borderWidth: .8,
                backgroundColor: [gradient,gradient,gradient,gradient,gradient],
                hoverBorderColor: 'pink',
                hoverBorderWidth:1,
                weight:5,
                borderAlign:'center',
                data:sortTopRevenue.map(event=>parseInt(event.result.sold * this.context.drizzle.web3.utils.fromWei(event.result.price))),
                }],					
                }	
              }
             else{
              return {
                labels: ['You','Havent','Created','Any','Event'],
                datasets: [{
                  label:'Hydro',
                  fontColor:'black',
                  backgroundColor: [gradient,gradient,gradient,gradient,gradient],
                  borderColor: 'rgb(228, 83, 138)',
                  borderWidth: .8,
                  backgroundColor: [gradient,gradient,gradient,gradient,gradient],
                  hoverBorderColor: 'pink',
                  hoverBorderWidth:1,
                  weight:5,
                  borderAlign:'center',
                  data: [10,5,10,5,10],
                  }],					
                  }	
               }
              }
              
            body = <div className="retract-page-inner-wrapper-alternative">

            <br /><br /><br />
      
            <div>
            <h2><i class="fas fa-chalkboard-teacher"></i> Dashboard</h2>
            <hr />
            <div className="row user-list mt-4">
           <div className="col-lg-4 pb-4 d-flex align-items-stretch" >
              <div className="dashboard-card">   
              <div className="dashboard-caption" style={{ backgroundImage: "url(/images/ethorange.png)"}}>
                  <h3><i class="fas fa-user-astronaut"></i> User Account</h3>
                  <img className="dashboard-img" src={'/images/ethereum.png'} ></img>
                  <p className="mt-2" title = {this.props.accounts[0]}>{this.props.accounts[0].slice(0,15) + '...'}</p>
                  </div>  
              </div>
              </div> 
      
              <div className="col-lg-4 pb-4 d-flex align-items-stretch" >
              <div className="dashboard-card">   
              <div className="dashboard-caption"style={{ backgroundImage: "url(/images/topics/" + topicsJson[21].image +")"}}>
              <h3><i className="fa fa-edit"></i> Total Number Of Created Events</h3>
                  <h4 className="dashboard-data">{eventCount.length}</h4>
                  <p className="dashboard-footer">Events</p>
                  </div>  
              </div>
              </div>
      
              <div className="col-lg-4 pb-4 d-flex align-items-stretch" >
              <div className="dashboard-card">   
              <div className="dashboard-caption" style={{ backgroundImage: "url(/images/topics/" + topicsJson[12].image +")"}}>
              <h3><i class="fas fa-ticket-alt" ></i> Total Number Of Tickets Sold</h3>
                  <h4 className="dashboard-data">{totalSold}</h4>
                  <p className="dashboard-footer">Tickets</p></div>
              </div>
              </div>
      
              <div className="col-lg-4 pb-4 d-flex align-items-stretch" >
              <div className="dashboard-events-card">   
              <div className="dashboard-events-caption" style={{ backgroundImage: "url(/images/topics/" + topicsJson[17].image +")"}}>
              <h3 title="Top 5 Events Based On Ticket Sale"><i class="fas fa-trophy"></i> Your Top 5 Events</h3>
              </div>
              {toplist &&<div className="dashboard-events">
              <div className="dashboard-events-list">
              <Link to="/myevents/1"><h4 className="mb-2">Events</h4></Link>
              {sortSold.map((event,index)=>( event.result.name.length > 15 ? <h4 key ={index} title={event.result.name} onClick={()=>this.goTo(event.id, event.result.name)}> {index +1}. {event.result.name.slice(0,15)+'...'}</h4>:<h4 title={event.result.name} onClick={()=>this.goTo(event.id, event.result.name)}>{index +1}. {event.result.name}</h4>))}
              </div>
              <div className="dashboard-events-list-sale">
              <h4 className="mb-2">Tickets Sold</h4>
              {sortSold.map((event,index)=>( <h4 key = {index} title={event.result.sold + " Tickets Sold"} onClick={()=>this.goTo(event.id, event.result.name)}>
                {event.result.sold}</h4>))}
              </div>
              </div> } 

              {!toplist &&<div className="dashboard-events">
              <h4 className="dashboard-no-event mt-5">You haven't created an event yet</h4>
              <Link to="/createevent">Try to create one.</Link>
              </div> }   
              </div>
              </div>

              <div className="col-lg-4 pb-4 d-flex align-items-stretch" >
              <div className="dashboard-events-card">   
              <div className="dashboard-events-caption" style={{ backgroundImage: "url(/images/topics/" + topicsJson[17].image +")"}}>
              <h3 title="Top 5 Events Based On Hydro Revenue"><i class="fas fa-award"></i> Your Top 5 Events</h3>
              </div>
              <div className="dashboard-bar">
              <Bar className ="bars"
                options={{
                responsive:true,
                maintainAspectRatio:false,
                title:{
                display: true,
                position:"top",
                text: 'Based On Hydro Revenue',
                fontSize: 16,
                lineHeight:1.5,
                padding:1,
                fontColor:'white',                   
                },    
                scales: {
                  yAxes: [{ticks: {beginAtZero:true,fontSize:10,fontColor:'white',fontStyle: '600',precision:0 }}],
                  xAxes: [{ticks: {beginAtZero:true,fontSize:12,fontColor:'white', fontStyle: '600' },barPercentage:1,display: false}]
                },
                elements:{
                rectangle:{borderSkipped:'bottom',}
                }  
                }} data={this.BarData} />
              </div> 

              
              </div>
              </div>
              
              <div className="col-lg-4 pb-4 d-flex align-items-stretch" >
              <div className="dashboard-events-card">   
              <div className="dashboard-events-caption" style={{ backgroundImage: "url(/images/topics/" + topicsJson[12].image +")"}}>
              <h3 title="Overall Limited Tickets Sold"><i class="fas fa-ticket-alt"></i> Sold Tickets (Limited) </h3>
              </div>
              <div className="dashboard-chart">
              <div className="mt-5">
						  <Doughnut data={this.DoughnutData} 
    						options={{
							  responsive:true,
							  maintainAspectRatio:false,
							  cutoutPercentage: 62, 
        					title:{
       						display: true,
        					position:"bottom",
       						text: 'Limited Tickets Sold',
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
              </div>   
              </div>
              </div>

              <div className="col-lg-4 pb-4 d-flex align-items-stretch" >
              <div className="dashboard-card">   
              <div className="dashboard-caption" style={{ backgroundImage: "url(/images/snowflake2.jpg)"}}>
                  <h3><img src={'/images/hydro.png'} className="dashboard-hydro" alt="" />  Total Hydro Revenue </h3>
                  <h4 className="dashboard-data">{numeral(revenue).format('0,0.00')}</h4>
                  <p className="dashboard-footer">Hydro</p></div>
              </div>
              </div>

              <div className="col-lg-4 pb-4 d-flex align-items-stretch" >
              <div className="dashboard-card">   
              <div className="dashboard-caption" style={{ backgroundImage: "url(/images/topics/" + topicsJson[20].image +")"}}>
                  <h3><i className="fas fa-hand-holding-usd"></i>  Total Dollar Revenue </h3>
                  <h4 className="dashboard-data">${numeral(revenue * this.state.hydro_market.usd).format('0,0.00')}</h4>
                  <p className="dashboard-footer">USD</p></div>
              </div>
              </div>


              <div className="col-lg-4 pb-4 d-flex align-items-stretch" >
              <div className="dashboard-card">  
              <div className="dashboard-caption" style={{ backgroundImage: "url(/images/uniswaps.jpg)"}}>
              <a href={'https://uniswap.exchange/swap'} target ='blank' className="mt-10"> 
              <p className="dashboard-uniswap"><i class="fas fa-sync"></i> BUY HYDRO WITH UNISWAP</p></a> 
              </div>               
              </div>
              </div>
            
            </div>
            <hr/>
 
            </div>
          </div>
            }
            
            
		

		return(
      <React.Fragment>
      <Carousel className="retract-page-inner-wrapper">
          <Carousel.Item className="slide1">
            <img className="d-block w-100" src="/images/topics/music.jpg" alt="First slide" />
            <Carousel.Caption>
              <h3>Check out a Concert</h3>
              <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
              <button className="btn btn-dark" onClick={() => {this.caruselClick("/topic/music/1")}}><i className="fas fa-ticket-alt"></i> Find Events</button>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item className="slide2">
          <img className="d-block w-100" src="/images/topics/charity-and-causes.jpg" alt="First slide" />
            <Carousel.Caption>
              <h3>Support a Local Charity</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              <button className="btn btn-dark" onClick={() => {this.caruselClick("/topic/charity-and-causes/1")}}><i className="fas fa-ticket-alt"></i> Find Events</button>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item className="slide3">
          <img className="d-block w-100" src="/images/topics/parties.jpg" alt="First slide" />
            <Carousel.Caption>
              <h3>Attend an Exclusive Party</h3>
              <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
              <button className="btn btn-dark" onClick={() => {this.caruselClick("/topic/parties/1")}}><i className="fas fa-ticket-alt"></i> Find Events</button>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item className="slide4">
          <img className="d-block w-100" src="/images/topics/sports-and-fitness.jpg" alt="First slide" />
            <Carousel.Caption>
              <h3>Play a New Sport</h3>
              <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
              <button className="btn btn-dark" onClick={() => {this.caruselClick("/topic/sports-and-fitness/1")}}><i className="fas fa-ticket-alt"></i> Find Events</button>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item className="slide5">
          <img className="d-block w-100" src="/images/slides/slide5.png" alt="First slide" />
            <Carousel.Caption>
              <h3>Create and Sell Tickets</h3>
              <p>Create your own event, it takes only a minute.</p>
              <button className="btn btn-dark" onClick={() => {this.caruselClick("/createevent")}}><i className="fas fa-ticket-alt"></i> Create Event</button>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
        {body}
	    

    </React.Fragment>
		);
  }
  componentDidMount() {
		this._isMounted = true;
		this.getHydroMarketValue();

	}
}

Dashboard.contextTypes = {
    drizzle: PropTypes.object
}

const mapStateToProps = state => {
    return {
		contracts: state.contracts,
		accounts: state.accounts
    };
};

const AppContainer = drizzleConnect(Dashboard, mapStateToProps);
export default AppContainer;
