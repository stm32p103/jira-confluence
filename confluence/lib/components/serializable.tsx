import * as React from "react";
import * as ReactDOM from "react-dom";

import { Serializable, Serializer } from '../storage';

export interface SerializableProps {
  serializer: Serializer;
  id: string;
  children?: any; 
}

export interface SerializableState {
  value: string;
}

/* ----------------------------------------------------------------------------
 * DropdownItemの情報をもとに、ドロップダウンを作る
 * ------------------------------------------------------------------------- */
export class SerializableText extends React.Component<SerializableProps,SerializableState> implements Serializable {
  state: SerializableState;
  constructor( public props: SerializableProps ) {
    super( props );
    
    this.state = { value: '' };
  }
    
  componentDidMount() { this.props.serializer.register( this.props.id, this ) }
  componentWillUnmount() { this.props.serializer.unregister( this.props.id ) }
  getValue() { return this.state.value }
  setValue( value: any ) { this.setState( { value: value } ) }
  
  update( evt: React.ChangeEvent<HTMLInputElement> ) {
    this.setState( { value: evt.target.value } );
  }

  render() {
    return <input type="text" value={this.state.value} onChange={ (e) => this.update( e ) }/>
  }
}
