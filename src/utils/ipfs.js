import IPFS from 'ipfs-api';

// Uses the Infura IPFS API: https://docs.ipfs.io/reference/http/api/

const ipfs = new IPFS({
	host: 'ipfs.infura.io',
	port: 5001,
	protocol: 'https'
});

export default ipfs;
