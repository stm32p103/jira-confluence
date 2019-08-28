const request = require(`request`);
const fs = require('fs');
const credential = require( './credential' );
const config = require( './config' );

class HttpClient {
	toRequestOption( url, method, option ) {
		let opt = Object.assign( { 
			url: url,
			method: method
		}, option );
		
		return opt;
	}
	
	_request( url, method, option ) {
		return new Promise( ( resolve, reject ) => {
			const opt = this.toRequestOption( url, method, option );
			request( opt, ( error, res, body ) => {
				if( !error && res.statusCode == 200 ) {
					resolve( body );
				} else {
					reject( res );
				}
			} );
		} );
	}
	
	async get( url, option ) {
		return await this._request( url, 'get', option );
	}

	async post( url, option ) {
		return await this._request( url, 'post', option );
	}
	
	async put( url, option ) {
		return await this._request( url, 'put', option );
	}
}

class HttpHeader {
	constructor( init ) {
		this.init = Object.assign( {}, init );
		this.body = {};
	}
	
	btoa( str ) {
		let buffer;
		if (Buffer.isBuffer(str)) {
			buffer = str;
		} else {
			buffer = new Buffer( str.toString(), 'binary' );
		}
		return buffer.toString( 'base64' );
	}
		
	addBasicAuthentication( cred ) {
		this.body[ 'Authorization' ] = 'Basic ' + this.btoa( cred.user + ':' + cred.pass );
	}
	
	addContentType( type ) {
		this.body[ 'Content-Type' ] = type;
	}
}

async function get( base, pid ) {
	const http = new HttpClient();
	const headers = new HttpHeader();
	headers.addBasicAuthentication( { user: credential.user, pass: credential.pass } );
	
	const url = `${base}/rest/api/content/${pid}?expand=version`;
	
	console.log( '-----------------------------------------------------------' );
	console.log( 'GET: ' + url );
	console.log( '-----------------------------------------------------------' );
	try {
		const response = await http.get( url, { 'headers': headers.body } );
		const current = JSON.parse( response ); 
		return current;
	} catch( err ) {
		console.error( 'error' )
		console.error( err );
	}
}

async function update( base, pid, content ) {
	const http = new HttpClient();
	const current = await get( base, pid );
	const version = 1 + current.version.number;
	const url = `${base}/rest/api/content/${pid}`;
	
	const data = {
		'version': { 'number': version },
		'body': { 
			'storage': {
				'value': content,
				'representation': 'storage'
			}
		},
		'title': current.title,
		'type': 'page'
	};
	
	try {
		const headers = new HttpHeader();
		headers.addBasicAuthentication( credential );
		headers.addContentType( 'application/json' );
		console.log( '-----------------------------------------------------------' );
		console.log( 'PUT: ' + url );
		console.log( '-----------------------------------------------------------' );
		const response = await http.put( url, { 'headers': headers.body, 'json': data } );
		
		console.log( 'Done. Version: ' + response.version.number );
	} catch( err ) {
		console.error( 'error' )
		console.error( err );
	}
}

function template( content ) {
	return `<p class=\"auto-cursor-target\"><br /></p><ac:structured-macro ac:name=\"html\" ac:schema-version=\"1\"><ac:plain-text-body><![CDATA[<div id="app"></div><script type="text/javascript">${content}</script>]]></ac:plain-text-body></ac:structured-macro><p class=\"auto-cursor-target\"><br /></p>`;
}


const pid = config.pageId;
const base = config.baseUrl;
const content = fs.readFileSync( config.src );
const output = template( content );

update( base, pid, output );

