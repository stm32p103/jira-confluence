import { AJSRestAPI, Request, queryToString } from '../lib';

export async function testRestApi( baseUrl: string, cid: string, key: string, cql: string ) {
    const api = new AJSRestAPI( baseUrl );

    const query = queryToString( {
        expand: `metadata.properties.${key}`
    } );
    console.log( query );
    
    console.log( '[create request]' );
    let req = Request.get( `/rest/api/content/${cid}?${query}` );
    console.log( req );
    
    console.log( '[get]' );
    let p = await api.request( req );
    console.log( p );

    
    req = Request.get( `/rest/api/content` )
//    
//    console.log( '[comments request]' );
//    let req = Request.get( `/rest/api/content/${cid}?${query}` );
//    console.log( req );
}
