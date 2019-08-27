import { ContentPropertyAccessor } from './lib';
//
AJS.$(document).ready( async () => {
    const property = new ContentPropertyAccessor( AJS.params.baseUrl );
    const cid = AJS.params.pageId;
    const key = 'sample';
    
    console.log( '---------------------------' );
    let p = await property.get( cid, key );
    console.log( p );

    console.log( '---------------------------' );
    let pAll = await property.getAll( cid );
    console.log( pAll );

    console.log( '---------------------------' );
    p = await property.set( cid, key, { sample: 'created' } );
    console.log( p );

    console.log( '---------------------------' );
    p = await property.set( cid, key, { sample: 'updated' } );
    console.log( p );

    let x = await property.getByCql( 'space=TEST and type=page', key );
    console.log( x );
} )
// http://localhost:8090/rest/api/content/search?cql=space=TEST%20and%20type=page&expand=metadata.properties.dropdowns