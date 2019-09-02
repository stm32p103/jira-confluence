import * as React from "react";
import { Serializer } from '../lib/storage';
import { SerializableDropdown, UIBuilder, Item } from '../lib/components';

const dropdownItems: { [ selection: string ]: Item[] } = {
    'SelA': [ 
      { value: '1', label: 'A-1' },
      { value: '2', label: 'A-2' },
      { value: '3', label: 'A-3' }
    ], 
    'SelB': [ 
      { value: '1', label: 'B-1' },
      { value: '2', label: 'B-2' }
    ]
}

export async function testBuildDropdown( serializer: Serializer, baseUrl: string, pageId: string, key: string ) {
  const builder = new UIBuilder();
  builder.addRenderer( 'dropdown', ( elem, sch ) => {
    const id = elem.getAttribute('id');
    const item = sch.data as Item[];
    return <SerializableDropdown id={id}
                     items={sch.data}
                     serializer={serializer}
                     setter={ data => data.v }
                     getter={ value => { return { v: value, s: elem.getAttribute('selection') } } }></SerializableDropdown>
  } );

  Object.keys( dropdownItems ).forEach( key => {
    builder.addSchema( `dropdown[selection="${key}"]`, { type: 'dropdown', data: dropdownItems[key] } );    
  } );
  builder.render();
}
