import { RestAPI, Request } from '../request';

export class AJSRestAPI {
    constructor( private base: string ) {}
    async request( req: Request ) {
        let response;
        
        let option: any = {
            url: this.base + req.url,
            type: req.method,
            success: ( res ) => {
                response = res;
            }
        };

        if( req.json ) {
            option.data = JSON.stringify( req.json );
            option. dataType = 'json';
            option.contentType = 'application/json; charset=UTF-8';
        }

        await AJS.$.ajax( option );
        
        return response;
    }
}
