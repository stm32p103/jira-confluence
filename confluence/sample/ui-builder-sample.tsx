import * as React from "react";
import { ContentPropertyAPI, AJSRestAPI } from '../lib';
import { Dropdown, UIBuilder, Item } from '../lib/components';

export async function testBuildDropdown() {
    const builder = new UIBuilder();
    builder.addRenderer( 'dropdown', ( elem, sch ) => {
        const id = elem.getAttribute('id');
        const item = sch.data as Item[];
        return <Dropdown items={item} id={id}/>
    } );

    const items: Item[] = [ 
        { value: '1', label: 'Test 1' },
        { value: '2', label: 'Test 2' },
        { value: '3', label: 'Test 3' },
        { value: '4', label: 'Test 4' },
        { value: '5', label: 'Test 5' }
    ];
    builder.addSchema( '[data-comp="dropdown"]', { type: 'dropdown', data: items } );
    builder.render();
}
