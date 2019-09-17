import React from 'react';
import { ContentPropertyAPI, ContentProperty, Range, InvalidVersionError, ContentPropertyList } from '@this/lib/api';

import { UIBuilder, UISchema, Dropdown, Item } from '@this/components';

class SerializableDropdown extends React.Component<{ items: Item[], id: string }, { value: string }> {
  state: { value: string };
  
  constructor( props: { id: string, items: Item[] } ) {
    super( props );
    this.state = { value: '' };
  }
  
  render() {
    return <Dropdown value={this.state.value} onChange={ value => this.setState({ value: value })} items={this.props.items} />
  }
}


export class DropdownController {
  // current
  range: Range = new Range();
  builder: UIBuilder;
  
  data: { [key:string]: any } = {};
  
  constructor( private api: ContentPropertyAPI ) {
    this.builder = new UIBuilder();
    this.builder.addRenderer( 'dropdown', ( target, schema ) =>  <Dropdown items={schema.data} /> );
  }

  async loadSelection( cid: string ) {
    let list: ContentPropertyList;
    list = await this.api.getAll( cid );
    
    if( list ) {
      list.results.forEach( cp => {
        const key = cp.key;
        const selection = cp.value;
        if( selection[0] && selection[0].label && selection[0].value ) {
          this.builder.addSchema( `dropdown[option="${key}"]`, { type: 'dropdown', data: selection } );
          console.log( this.builder );
        }
      } );
    }
  }

  async build() {
    this.builder.render();
  }
  
}
