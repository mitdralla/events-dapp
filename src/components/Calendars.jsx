import React, { Component } from 'react';
import {Calendar,momentLocalizer} from 'react-big-calendar';
import { Link } from 'react-router-dom';
import moment from 'moment';
import main from '../styles/main.css'
import 'react-big-calendar/lib/css/react-big-calendar.css';

import Web3 from 'web3';
import {Open_events_ABI, Open_events_Address} from '../config/OpenEvents';

class Calendars extends Component {
    constructor(props) {

        super(props);
        this.state = {
           
            Events_Blockchain:[],
            activeEvents:'',
            latestblocks:6000000,
            blocks:5000000,
            events:[],
        }
        this._isMounted = false;
    }

    async loadBlockchain(){
    
        const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws/v3/72e114745bbf4822b987489c119f858b'));
        const openEvents =  new web3.eth.Contract(Open_events_ABI, Open_events_Address);
        
        if (this._isMounted){
        this.setState({openEvents});
        this.setState({Events_Blockchain:[]});}
        const dateTime = Date.now();
        const dateNow = Math.floor(dateTime / 1000);
        
        const blockNumber = await web3.eth.getBlockNumber();
        if (this._isMounted){
        this.setState({blocks:blockNumber - 50000});
        this.setState({latestblocks:blockNumber - 1});
        this.setState({Events_Blockchain:[]});}
      
        openEvents.getPastEvents("CreatedEvent",{fromBlock: 5000000, toBlock:this.state.latestblocks})
        .then(events=>{
        if (this._isMounted){
        this.setState({loading:true})
        this.setState({Events_Blockchain:events});
        this.setState({loading:false})
        this.setState({active_length:this.state.Events_Blockchain.length})
        
        }
         
        }).catch((err)=>console.error(err))
    
        //Listens for New Events
        openEvents.events.CreatedEvent({fromBlock: blockNumber, toBlock:'latest'})
        .on('data', (log) => setTimeout(()=> {
        if (this._isMounted){
        this.setState({loading:true});
        this.setState({Events_Blockchain:[...this.state.Events_Blockchain,log]});
        this.setState({active_length:this.state.Events_Blockchain.length})}
        this.setState({loading:false});
        },10000))
      }
    
    
    goToEvent = (event_calendar)=>{
            let rawTitle = event_calendar.title;
            var titleRemovedSpaces = rawTitle;
	        titleRemovedSpaces = titleRemovedSpaces.replace(/ /g, '-');
            var pagetitle = titleRemovedSpaces.toLowerCase()
            .split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');
	        let titleURL = "/event/"+pagetitle+"/" + event_calendar.id;
    
            this.props.history.push(titleURL);
        }
    
    render() {
        let body ='';
        const localizer = momentLocalizer(moment) // or globalizeLocalizer
        {
        let events_calendar = []

        for(var i = 0;i<this.state.Events_Blockchain.length;i++){
            events_calendar.push({
            id:this.state.Events_Blockchain[i].returnValues.eventId,
            title:this.state.Events_Blockchain[i].returnValues.name,
            start:parseInt(this.state.Events_Blockchain[i].returnValues.time,10)*1000,
            end:parseInt(this.state.Events_Blockchain[i].returnValues.time,10)*1000,
            allDay:true,
                })
            }

        body = 
            <div style={{ height: '500pt'}}>
            <Calendar
              localizer={localizer}
              events={events_calendar}
              defaultDate={moment().toDate()}
              onSelectEvent={events_calendar =>this.goToEvent(events_calendar)}
              views={['month','day','agenda']} 
            />
            </div>          
            }
        
       return (
        <div className="retract-page-inner-wrapper-alternative">
        <div className="pl-2 pr-2">
            <h2 className="col-md-10"><i className="fa fa-calendar-alt"></i> Event Calendar</h2> 
        <hr/>
            {body}
          </div>      
        </div>  
        )
    }

    componentDidMount(){
        this._isMounted = true;
        this.loadBlockchain();

    }

    componentWillUnmount(){
        this._isMounted = false;
    }
}
export default Calendars;