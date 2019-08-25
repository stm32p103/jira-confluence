import * as React from "react";
import * as ReactDOM from "react-dom";

import { ContentPropertyAccessor } from './lib/content-property';
import { DropdownItem } from './lib/dropdown-item';


AJS.$(document).ready( async () => {
    const cid = AJS.params.pageId;
    setPageId( cid );
    
    const key = 'dropdowns';    
    const view = <div>
        <input type="button" value="Save to content property" onClick={ (e) => saveDefinition( getPageId(), key ) }></input>
        <input type="button" value="Load from content property" onClick={ (e) => createDropdown( getPageId(), key ) }></input>
    </div>;
    const app = AJS.$('#app').get(0);
    
    ReactDOM.render( view, app );
} )

function getPageId() {
    return ''+AJS.$('#pageId').val();
}

function setPageId(cid: string) {
    $('#pageId').val( cid );
}

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
        const target = AJS.$(`id-element[key="${key}"]`);
        const item = new DropdownItem();
        item.fromItem( src.items );

        target.each( ( index, element ) => {
            console.log( element );
            ReactDOM.render( <select id={element.getAttribute('id')} >{item.toJsx()}</select>, element );
        } )
    }
}

