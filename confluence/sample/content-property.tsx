import { ContentPropertyAPI, AJSRestAPI } from '../lib';

export async function testContentProperty( baseUrl: string, cid: string, key: string, cql: string ) {
    const api = new ContentPropertyAPI( new AJSRestAPI( baseUrl ) );
    
    console.log( '[get]' );
    let p = await api.get( cid, key );
    console.log( p );

    console.log( '[getAll]' );
    let pAll = await api.getAll( cid );
    console.log( pAll );

    console.log( '[set] create' );
    p = await api.set( cid, key, { test: 'created' } );
    console.log( p );

    console.log( '[set] update' );
    p = await api.set( cid, key, { test: 'updated' } );
    console.log( p );

    console.log( '[getByCql]' );
    let x = await api.getByCql( cql, key );
    console.log( x );
}
