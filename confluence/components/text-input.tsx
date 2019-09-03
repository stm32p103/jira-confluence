import * as React from "react";
import { Serializable, Serializer } from '@this/lib';
import { SerializableUI } from './serializable';

interface Props {
  id: string;
  serializer: Serializer;
  getter?: ( value: any ) => any;
  setter?: ( newValue: any ) => any;
}

interface State {
  value: string;
}

/* ----------------------------------------------------------------------------
 * 共通部が多いので見直す
 * ------------------------------------------------------------------------- */
export class SerializableText extends React.Component<Props,State>{
  state: State;
  constructor( public props: Props ) {
    super( props );
    this.state = { value: '' }
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
                           <input type="text" value={this.state.value} onChange={ (e) => this.update( e.target.value ) }/>
           </SerializableUI>;
  }
}
