import { ContentPropertyAPI, InvalidVersionError } from '@this/lib';
import { AJSRestAPI } from '@this/common';

export async function testContentProperty( baseUrl: string, cid: string, key: string) {
    const api = new ContentPropertyAPI( new AJSRestAPI( baseUrl ) );

    let p;
    console.log( '[get] not found' );
    try {
      p = await api.get( cid, key );
      console.log( p );
    } catch( err ) {
      console.log( '[OK] Not found' );
      console.log( err );
    }
    
    console.log( '[set] Create' );
    p = await api.set( cid, key, { test: 'created' } );
    console.log( p );

    console.log( '[get] after created' );
    p = await api.get( cid, key );
    console.log( p );
    
    console.log( '[getAll]' );
    let pAll = await api.getAll( cid );
    console.log( pAll );

    console.log( '[set] update' );
    p = await api.set( cid, key, { test: 'updated' } );
    console.log( p );

    console.log( '[set] update...invalid version.' );
    try {
      p = await api.set( cid, key, { test: 'updated' }, { version: 1 } );
      console.log( '[NG]');
    } catch( err ) {
      if( err instanceof InvalidVersionError ) {
        console.log( '[OK] Invalid version.' );
      }
    }

    console.log( '[delete] start' );
    await api.delete( cid, key );
    console.log( '[delete] done' );
}



export async function testContentPropertyCql( baseUrl: string, cql: string, key: string ) {
  const api = new ContentPropertyAPI( new AJSRestAPI( baseUrl ) );
  
  console.log( '[getByCql]' );
  let x = await api.getByCql( cql, key );
  console.log( x );
}







