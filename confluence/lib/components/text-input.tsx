import * as React from "react";
import * as ReactDOM from "react-dom";
import { Serializable, Serializer } from '../storage';

interface Props {
  serializer: Serializer;
  id: string;
}

interface State {
  value: string;
}

/* ----------------------------------------------------------------------------
 * 共通部が多いので見直す
 * ------------------------------------------------------------------------- */
export class TextInput extends React.Component<Props,State> implements Serializable {
  state: State;
  constructor( public props: Props ) {
    super( props );
    this.state = { value: 'init' }
  }
  
  get() { 
    console.log( 'get' )
    return this.state.value;
  }
  
  set( value: string ) { 
    console.log( 'set' )
    this.setState( { value: value } )
  }
  
  componentDidMount() {
    if( this.props.serializer ) {
      console.log( 'register' )
      this.props.serializer.register( this.props.id, this );      
    }
  }
  
  componentWillUnmount() {
    if( this.props.serializer ) {
      console.log( 'unregister' )
      this.props.serializer.unregister( this.props.id ); 
    }
  }
  
  update( evt: React.ChangeEvent<HTMLInputElement> ) {
    this.set( evt.target.value );
  }

  render() {
    return <form className="aui"><input type="text" value={this.state.value} onChange={ (e) => this.update( e ) }/></form>
  }
}
