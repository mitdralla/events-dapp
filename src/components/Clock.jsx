import React, { Component } from 'react';


class Clock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            days:0,
            hours:0,
            minutes:0,
            seconds:0,
            dateNow:0,
        }
        this._isMounted = false;
    }


    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){setInterval(()=>this.getTimeUntil(this.props.deadline),1000)}
    }
    
    async getTimeUntil(deadline){
        if (this._isMounted){
        const dateTime = Date.now();
        const dateNow = Math.floor(dateTime / 1000);
        const time = await Date.parse(deadline) - Date.parse(new Date());
        const seconds = await Math.floor((time/1000) %60);
        const minutes = await Math.floor((time/1000/60) %60);
        const hours = await Math.floor(time/(1000*60*60) %24);
        const days = await Math.floor(time/(1000*60*60*24));
        //console.log(this.props.event_unix,'days',  days, 'hours', hours, 'minutes', minutes, 'seconds',seconds );
        this.setState({days,hours,minutes,seconds,dateNow});}
    }
    
    componentWillUnmount(){
        this._isMounted = false;
    }
    
    render() {
     if(this.props.event_unix < this.state.dateNow)
        return(           
        <div>     
            <div className = "countdown"><p  className="mt-1 mb-1"><span>⚠️ This event has already ended.</span></p></div>             
        </div>)
                                             
     else
       return (
        <div className = "countdown">
            <h5 className="mt-2 mb-1">This Event Will Close In</h5>
            <div className="clock">
                <p >{this.state.days} Days</p> 
                <p>{this.state.hours} Hours</p>
                <p> {this.state.minutes} Minutes</p>
                <p> {this.state.seconds} Seconds</p>
            </div>   
        </div>  
        )
    }
}
export default Clock;