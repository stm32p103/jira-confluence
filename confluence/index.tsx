import React from 'react';
import * as ReactDOM from "react-dom";
import { testContentProperty, testRestApi, testDom, testBuildDropdown, testContentPropertyCql } from './sample';

import { AJSRestAPI, Request } from './lib';
import { ContentPropertyAPI } from './lib/api';
import { Serializer, ContentPropertyStorage } from './lib/storage';
import { TextInput } from './lib/components';

AJS.$(document).ready( async () => {
  console.log( AJS.params );
  const baseUrl = AJS.params.baseUrl;
  const pageId = AJS.params.pageId;
  const spaceKey = AJS.params.spaceKey;
  const key = 'sample';
  
  const cql = `space=${spaceKey} and type=page`;
  const dropdownKey = 'stored';
  const serializer = new Serializer( new ContentPropertyStorage( new ContentPropertyAPI( new AJSRestAPI( baseUrl ) ), pageId, dropdownKey ) );

  const container = AJS.$('#app').get(0);
  const jsx: JSX.Element[] = [];
  const App = () => <div>
  <div className="aui-buttons">
    <button className="aui-button" onClick={ () => { testContentProperty( baseUrl, pageId, key ) } } >Content Property</button>
    <button className="aui-button" onClick={ () => { testContentPropertyCql( baseUrl, cql, key ) } } >CQL</button>
    <button className="aui-button" onClick={ () => { testRestApi( baseUrl, pageId, key, cql ) } } >REST API</button>
    <button className="aui-button" onClick={ () => { testDom( AJS.$('#target').get(0) ) } } >Tree</button>
    <button className="aui-button" onClick={ () => { testBuildDropdown( serializer, baseUrl, pageId, dropdownKey ) } } >BuildDropdown</button>
    <button className="aui-button" onClick={ () => { testContentPropertyCql( baseUrl, cql, dropdownKey ) } } >Dropdown CQL</button>
    <button className="aui-button" onClick={ () => { serializer.serialize() } } >Serialize</button>
    <button className="aui-button" onClick={ () => { serializer.deserialize() } } >Deserialize</button>
  </div>
  <div id="target"></div>
  </div>;
  ReactDOM.render( <App/>, container );
} );
