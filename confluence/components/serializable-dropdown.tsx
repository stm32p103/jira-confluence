import * as React from "react";
import { Serializable, Serializer } from '@this/lib';
import { Dropdown, Item } from './dropdown';
import { SerializableUI } from './serializable';

/* ----------------------------------------------------------------------------
 * 同じプロパティが必要
 * ------------------------------------------------------------------------- */
interface Props {
  id: string;
  items: Item[];
  serializer: Serializer;
  getter?: ( value: any ) => any;
  setter?: ( newValue: any ) => any;
}

export interface State {
  value: string;
}
/* ----------------------------------------------------------------------------
 * DropdownItemの情報をもとに、ドロップダウンを作る
 * なんだか無駄が多い
 * ------------------------------------------------------------------------- */
export class SerializableDropdown extends React.Component<Props,State> {
  state: State;
  constructor( public props: Props ) {
    super( props );
    this.state = { value: this.props.items[0].value };
  }
  
  update( value: string ) {
    this.setState( { value: value } );
  }
  
  get value() {
    let value = this.state.value;
    if( this.props.getter ) {
      value = this.props.getter( value );
    }
    return value;
  }
  
  onChange( data: any ) {
    let value = '';
    if( this.props.setter ) {
      value = this.props.setter( data );
    } else {
      value = data;
    }
    
    this.update( value );
  }
  
  render() {
    return <SerializableUI id={this.props.id}
                           serializer={this.props.serializer}
                           value={this.value}
                           onChange={ data => this.onChange( data ) }>
             <Dropdown value={this.state.value} items={this.props.items} onChange={ value => this.update( value ) } ></Dropdown>
           </SerializableUI>;
  }
}