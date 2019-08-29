type Method = 'get' | 'post' | 'put' | 'delete' | 'patch';

export type RequestOption = {
    data?: any;
    header?: { [name:string]: string };
}

export class Request {
    method: Method;
    url: string;
    data?: any;
    
    private constructor( req: Partial<Request> ) {
        Object.assign( this, req );
    }
    
    private static create( method: Method, url: string, option: RequestOption ) {
        let src = Object.assign( { 
            method: method,
            url: url
        }, option );

        return new Request( src );
    }
    
    static get( url: string, param: RequestOption = {} ) {
        return Request.create( 'get' as Method, url, param );
    }

    static post( url: string, param: RequestOption = {} ) {
        return Request.create( 'post' as Method, url, param );
    }

    static delete( url: string, param: RequestOption = {} ) {
        return Request.create( 'delete' as Method, url, param );
    }

    static put( url: string, param: RequestOption = {} ) {
        return Request.create( 'put' as Method, url, param );
    }
    
    static patch( url: string, param: RequestOption = {} ) {
        return Request.create( 'patch' as Method, url, param );
    }
    
    attatchData( data: any ) {
        this.data = data;
    }
}
