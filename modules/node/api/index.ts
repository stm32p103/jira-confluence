import { RestAPI, Request } from '@this/common/request';
import * as request from 'request';

function btoa( str: string ) {
  let buffer = Buffer.from( str.toString(), 'binary' );
  return buffer.toString( 'base64' );
}

export interface NodeRestAPIOptions {
  baseUrl: string,
  auth?: {
    user: string;
    pass: string;
  }
}

export class NodeRestAPI {
  constructor( private options: NodeRestAPIOptions ) {}
  
  async request( req: Request ) {
    return await new Promise( ( resolve, reject ) => {
      let headers = {};
      let option: any = {
        url: this.options.baseUrl + req.url,
        method: req.method
      };

      if( this.options.auth ) {
        headers[ 'Authorization' ] = 'Basic ' + btoa( this.options.auth.user + ':' +  this.options.auth.pass );
      }
    
      if( req.data ) {
        headers[ 'Content-Type' ] = 'application/json; charset=UTF-8';
        option['json'] = JSON.stringify( req.data );
      }
      
      option[ 'headers' ] = headers;
      request( option, ( error, res, body ) => {
        if( !error && res.statusCode == 200 ) {
          resolve( JSON.parse( body ) );
        } else {
          reject( res );
        }
      } );
    } );
  }
}

