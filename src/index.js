import React from 'react';
import ReactDOM from 'react-dom';
import { DrizzleProvider } from "drizzle-react";
import App from './components/App';

import OpenEvents from './config/OpenEvents.json';
import StableToken from './config/StableToken.json';


const options = {

	
	contracts: [OpenEvents, StableToken],
	
	events: {
		OpenEvents: ['CreatedEvent','SoldTicket']
	},
	polls:{
		blocks:2500
	},
	
	transactions:{
		txHash:{
			
		}
	}
};
//debugger;
//const rootElement = document.getElementById("root")
//ReactDOM.render(<App/>,rootElement);
ReactDOM.render(
    <DrizzleProvider options={options}>
		<App />
	</DrizzleProvider>,
    document.getElementById("root")
);
