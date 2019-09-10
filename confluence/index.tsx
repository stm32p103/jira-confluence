import React from 'react';
import * as ReactDOM from "react-dom";
import { testContentProperty, testRestApi, testDom, testBuildDropdown, testContentPropertyCql } from './sample';

import { AJSRestAPI, Request } from '@this/common';
import { ContentPropertyAPI } from './lib/api';
import { Dropdown, List, ListItem } from '@this/components';

$(document).ready( () => {
  console.log( AJS.params );
  const baseUrl = AJS.params.baseUrl;
  const pageId = AJS.params.pageId;
  const spaceKey = AJS.params.spaceKey;
  const key = 'sample';
  
  const cql = `space=${spaceKey} and type=page`;
  const dropdownKey = 'stored';
  
  const container = $('#app');
  const target = $('#target');
  
  const items: ListItem[] = [ 
    { key: 'aaa', label: 'AAA' },  
    { key: 'bbb', label: 'BBB' },
    { key: 'ccc', label: 'CCC' },
    { key: 'ddd', label: 'DDD' },
    { key: 'eee', label: 'EEE' }
  ];
  
  const App = () => <div><ListTest items={items} /></div>;
  ReactDOM.render( <App/>, container.get(0) );
} );

//    <button className="aui-button" onClick={ () => { testContentProperty( baseUrl, pageId, key ) } } >Content Property</button>
//    <button className="aui-button" onClick={ () => { testContentPropertyCql( baseUrl, cql, key ) } } >CQL</button>
//    <button className="aui-button" onClick={ () => { testRestApi( baseUrl, pageId, key, cql ) } } >REST API</button>
//    <button className="aui-button" onClick={ () => { testBuildDropdown( container, baseUrl, pageId, dropdownKey ) } } >BuildDropdown</button>
//    <button className="aui-button" onClick={ () => { testContentPropertyCql( baseUrl, cql, dropdownKey ) } } >Dropdown CQL</button>


export class ListTest extends React.Component<{ items: ListItem[] },{selections: string[]}> {
  state: { selections: string[] };
  
  constructor( props: { items: ListItem[] } ) {
    super( props );
    this.state = { selections: this.props.items.map( item => item.key ) };
  }
  
  handleChange( sel: string[] ) {
    console.log( sel );
     this.setState( { selections: sel } );
  }
  
  render() {
    return <List items={this.props.items} selections={this.state.selections} onChange={(sel) => this.handleChange(sel) } />;    
  }
}
