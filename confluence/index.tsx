import React, { Component } from 'react';
import * as ReactDOM from "react-dom";
import { Dropdown } from './components';
//import { App } from './app/app';
import { ContentPropertyAccessor, Item, DropdownItem } from './lib';

export interface Props {
    content: string;
}


interface Schema {
    type: string;
    data: any;
}

type Renderer = ( elem: Element, schema: Schema ) => JSX.Element;


AJS.$(document).ready( async () => {
    const builder = new ControlBuilder();
    builder.addRenderer( 'dropdown', ( elem, sch ) => {
        const id = elem.getAttribute('id');
        const item = sch.data as Item[];
        console.log( sch );
        return <Dropdown items={item} id={id}/>
    } );

    builder.addSchema( '[key="dr1"]', { type: 'dropdown', data: [ { value: '1', label: '1', items:[] }, { value: '2', label: '2', items:[] }, { value: '3', label: '3', items:[] } ] } );
    builder.addSchema( '[key="dr2"]', { type: 'dropdown', data: [ { value: 'b', label: 'x', items:[] } ] } );
    builder.addSchema( '[key="dr3"]', { type: 'dropdown', data: [ { value: 'b', label: 'x', items:[] } ] } );
    
    builder.render();
} );


class ControlBuilder {
    private renderer: { [type: string]: Renderer } = {};
    private schema: { [ selector: string ]: Schema } = {};
    
    addRenderer( type: string, renderer: Renderer ) {
        this.renderer[ type ] = renderer;
    }
    
    addSchema( selector: string, schema: Schema ) {
        this.schema[ selector ] = schema;
    }
    
    render() {
        for( let selector in this.schema ) {
            const targets = document.querySelectorAll( selector );
            for( let i=0; i<targets.length; i++ ) {
                const target = targets.item(i);
                const schema = this.schema[ selector ];
                const render = this.renderer[schema.type ];
                ReactDOM.render( render( target, schema ), target ); 
            }
        }
    }
}
