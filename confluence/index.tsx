import * as React from "react";
import * as ReactDOM from "react-dom";

import { ContentPropertyAccessor } from './lib/content-property';
import { DropdownItem } from './lib/dropdown-item';

AJS.$(document).ready( async () => {
    const cid = AJS.params.pageId;
    const key = 'dropdowns';
    const view = [ 
        <input type="button" value="Save to content property" onClick={ (e) => saveDefinition( cid, key ) }></input>,
        <input type="button" value="Load from content property" onClick={ (e) => createDropdown( cid, key ) }></input> ]
        
    const app = AJS.$('#app').get(0);
    ReactDOM.render( view, app );
} )

async function saveDefinition( cid: string, key: string ) {
    const property = new ContentPropertyAccessor( AJS.params.baseUrl );
    const dropdowns = AJS.$('dropdown[key]');
    
    const data = dropdowns.map( ( index, elem ) => {
        let definition = new DropdownItem( elem );
        let items = definition.getItem();
        
        return { key: elem.getAttribute('key'), items: items };
    } ).get();
    
    const res = await property.set( cid, key, data );
    console.log( cid );
    console.log( res );
}

async function createDropdown( cid: string, key: string ) {
    const property = new ContentPropertyAccessor( AJS.params.baseUrl );
    
    const prop = await property.get( cid, key );
    const data = prop.value;
    
    console.log( data );
    for( let src of data ) {
        const key = src.key;
        const target = AJS.$(`[key="${key}"]`);
        const item = new DropdownItem();
        item.fromItem( src.items );

        target.each( ( index, element ) => {
            console.log( element );
            ReactDOM.render( <select id={element.getAttribute('id')} >{item.toJsx()}</select>, element );
        } )
    }
}


//items.fromElement( AJS.$('dropdown[key]')[0] );
//let y = conv.toJsxElements( xx );

//let target = AJS.$('#target');
//ReactDOM.render( <select>{items.toJsx()}</select>, x.get(0) );
//let property = new ContentPropertyAccessor( AJS.params.baseUrl );
//const cid = AJS.params.pageId;
//const key = 'sample';

//console.log( '---------------------------' );
//let p = await property.get( cid, key );
//console.log( p );
//
//console.log( '---------------------------' );
//let pAll = await property.getAll( cid );
//console.log( pAll );
//
//console.log( '---------------------------' );
//p = await property.set( cid, key, { sample: 'created' } );
//console.log( p );
//
//console.log( '---------------------------' );
//p = await property.set( cid, key, { sample: 'updated' } );
//console.log( p );
//
//console.log( '---------------------------' );
//await property.delete( cid, key );
//p = await property.get( cid, key );
//console.log( p );