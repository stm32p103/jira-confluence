import { RestAPI, Request } from '../request';

export class AJSRestAPI {
  constructor( private base: string ) {}
  async request( req: Request ) {
    return await new Promise( ( resolve, reject ) => {
      let option: any = {
          url: this.base + req.url,
          type: req.method,
          success: ( res ) => {
            resolve( res );
          },
          error: ( err ) => {
            reject( err );
          }
      };

      if( req.data ) {
        option.data = JSON.stringify( req.data );
        option. dataType = 'json';
        option.contentType = 'application/json; charset=UTF-8';
      }
      
      AJS.$.ajax( option );
    } );
  }
}
