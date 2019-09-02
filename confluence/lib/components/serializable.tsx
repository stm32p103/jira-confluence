import * as React from "react";
import { Serializable, Serializer } from '../storage';

/* ----------------------------------------------------------------------------
 * getter: ストレージから
 * ------------------------------------------------------------------------- */
export interface SerializableProperty {
  id: string;
  serializer: Serializer;
  children: any;
  value: any;
  onChange: ( data: any ) => void;  
}

/* ----------------------------------------------------------------------------
 * DropdownItemの情報をもとに、ドロップダウンを作る
 * ------------------------------------------------------------------------- */
export class SerializableUI extends React.Component<SerializableProperty> implements Serializable {
  constructor( public props: SerializableProperty ) {
    super( props );
  }

  get() {
    return this.props.value;
  }

  set( value: any ) {
    this.props.onChange( value );
  }
  
  componentDidMount() {
    if( this.props.serializer ) {
      this.props.serializer.register( this.props.id, this );      
    }
  }
  componentWillUnmount() {
    if( this.props.serializer ) {
      this.props.serializer.unregister( this.props.id ); 
    }
  }

  update( value: string ) {
    this.setState( { value: value } );
  }
 
  render() {
    return this.props.children;
  }
}