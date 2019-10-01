const http = require('http');
const httpProxy = require('http-proxy');
const HttpProxyRules = require('http-proxy-rules');
const port = 10000;

// https://github.com/donasaur/http-proxy-rules
const rules = new HttpProxyRules( {
  rules: {
    '/jira(/?.*)$'       : 'http://localhost:10080/jira$1',
    '/confluence(/?.*)$' : 'http://localhost:8090/confluence$1'
  }
} );

const proxy = httpProxy.createProxy();
proxy.on('error', function (err, req, res) {
  res.writeHead( 500, { 'Content-Type': 'text/plain' } );
  res.end(err);
});
  
http.createServer( ( req, res) => {
  const target = rules.match( req );
  if( target ) {
    return proxy.web( req, res, { target: target } );
  }
  
  // no match found
  res.writeHead( 500, { 'Content-Type': 'text/plain' } );
  res.end( "Requested Url didn't match any of the listed rules.");
} ).listen( port );

console.log( `Proxy is listening on port ${port}.`);


 process.on('SIGINT', () => {
  console.log( 'Proxy closed.' );
  httpProxy.close();
});
