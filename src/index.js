import React from 'react';
import ReactDOM from 'react-dom';
import { DrizzleProvider } from "drizzle-react";
import App from './components/App';
import Web3 from "web3";

import OpenEvents from './config/OpenEvents.json';
import StableToken from './config/StableToken.json';


const options = {
	web3:{
		customProvider: new Web3(('wss://rinkeby.infura.io/ws/v3/72e114745bbf4822b987489c119f858b'))
	},

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
