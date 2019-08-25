import { ContentPropertyAccessor } from './lib/content-property';
import { Hello } from './components/hello';
import * as React from "react";
import * as ReactDOM from "react-dom";

AJS.$(document).ready( async () => {
    let sample = AJS.$( '[key="sample"]' );
    
    sample.each( ( index, element ) => {
        const x = element.getAttribute('id');
        ReactDOM.render( <Hello macroId={x}/>,element );
    } );
    
//    let property = new ContentPropertyAccessor( AJS.params.baseUrl );
//    const cid = AJS.params.pageId;
//    const key = 'sample';

//    console.log( '---------------------------' );
//    let p = await property.get( cid, key );
//    console.log( p );
//
//    console.log( '---------------------------' );
//    let pAll = await property.getAll( cid );
//    console.log( pAll );
//
//    console.log( '---------------------------' );
//    p = await property.set( cid, key, { sample: 'created' } );
//    console.log( p );
//
//    console.log( '---------------------------' );
//    p = await property.set( cid, key, { sample: 'updated' } );
//    console.log( p );
//
//    console.log( '---------------------------' );
//    await property.delete( cid, key );
//    p = await property.get( cid, key );
//    console.log( p );
} )

