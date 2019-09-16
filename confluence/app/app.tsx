import React from 'react';
import { NewPropertyComponent } from './new-property-component'
import { ControlComponent } from './control-component'
import { PropTable, PropData } from './property-table';

import { ContentPropertyAPI, ContentProperty, Range, InvalidVersionError, ContentPropertyList } from '@this/lib/api';

// material-ui
import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core'
import { Paper } from '@material-ui/core'
import { Checkbox } from '@material-ui/core'


export class Controller {
  // current
  range: Range = new Range();
  
  constructor( private api: ContentPropertyAPI ) {}

  async load( cid: string ) {
    return await this.api.getAll( cid );
  }
  
  async save( cid: string, key: string, json: string ) {
    let data = JSON.parse( json );
    console.log( data );
    await this.api.set( cid, key, data );
  }
  
  
}



interface Props {
  controller: Controller;
  cid: string;
}

interface State {
  editable: boolean;
  key: string;
  value: string;
  cps: PropData[];
}

export class AppView extends React.Component<Props, State>{
  state: State;
  constructor( props: Props ){
    super( props );
    
    this.state = {
      editable: true,
      key: '',
      value: '{}',
      cps: []
    }
  }
  
  async submit() {
    console.log('submit')
    try {
      await this.props.controller.save( this.props.cid, this.state.key, this.state.value );      
    } catch( err ) {
      console.log( 'already exists' );
    }
    
    await this.load();
  }
  
  async componentDidMount() {
    await this.load();
  }
  
  save() {
    console.log( 'save current dropdown' );
  }
  
  async load() {
    let res: ContentPropertyList;
    try {
      res = await this.props.controller.load( this.props.cid );
    } catch ( err ) {
      console.log( err );
    }
    
    if( res ) {
      const cps = res.results.map( cp => { return { 
        propKey: cp.key,
        key: cp.key,
        value: JSON.stringify( cp.value ),
        version: cp.version.number,
        date: cp.version.when
        } 
      } );
      
      this.setState( { cps: cps } );
    }
  }

  checkValid() {
    // bimyo
    let validity = (this.state.key.length > 0);

    try {
      const data = JSON.parse( this.state.value );
    } catch( err ) {
      if( err instanceof SyntaxError ) {
        validity = false;
      }
    }
    return validity;
  }
  
  toggleEditable() {
    this.setState( { editable: !this.state.editable} );
  }
  
  render() {
    return <div>
      <Paper>
        <ControlComponent save={()=>this.save()} load={()=>this.load()} toggle={()=>this.toggleEditable()} editable={this.state.editable}  />
        <NewPropertyComponent 
          propKey={this.state.key}
          value={this.state.value}
          isValid={this.checkValid()} 
          onSubmit ={()=>this.submit()}
          onKeyUpdate={ key => this.setState( {key: key} ) }
          onValueUpdate={ value => this.setState( {value: value} ) } />
        <PropTable cps={ this.state.cps } />
      </Paper>
    </div>
  }
}

/*
ユーザがCPをクリックすると、エディタ画面に表示される
ユーザがToggleを押すと、反転する
 */

/* ユーザがCPをクリックすると、エディタ画面に表示される */

/* ユーザがCPをクリックすると、エディタ画面に表示される */
