import * as ReactDOM from 'react-dom';
import React from 'react';
import * as DOM from '@this/common';

export interface Item {
    label: string;
    value: string;
    items?: Item[];
}

// https://reactjs.org/docs/dom-elements.html
// htmlにない属性は付けられないので、data-と命名するとよいらしい

export function testDom( target: Element ) {
    const List = ( prop: { val: string; label: string, children } ) => <ul data-value={prop.val} data-label={prop.label}>{prop.children}</ul>;
    const Item = ( prop: { val: string; label: string } ) => <li data-value={prop.val} data-label={prop.label}>{prop.label}</li>;
    ReactDOM.render( <List val="x" label="root">
            <Item val="1" label="a"></Item>
            <Item val="2" label="b"></Item>
            <Item val="3" label="c"></Item>
        </List>, target )
        
    const result = DOM.scan( target.children[0], ( e, children: Item[] ) => {
        let tmp: Item = {
            value: e.getAttribute( 'data-value' ),
            label: e.getAttribute( 'data-label' ),
        };
        
        if( children.length > 0 ) {
            tmp.items = children;
        }
        
        return tmp;
    } );
    
    console.log( result );
}

