import React from 'react';

import * as ReactDOM from "react-dom";
import { testContentProperty, testRestApi, testDom, testBuildDropdown, testContentPropertyCql } from './sample';

import { AJSRestAPI, Request } from '@this/common';
import { ContentPropertyAPI } from './lib/api';
import { Serializer, ContentPropertyStorage } from '@this/lib';
import { Dropdown, testList } from '@this/components';
import { ContentPropertyView } from './util/property-view';


AJS.$(document).ready( async () => {
  console.log( AJS.params );
  const baseUrl = AJS.params.baseUrl;
  const pageId = AJS.params.pageId;
  const spaceKey = AJS.params.spaceKey;
  const key = 'sample';
  
  const cql = `space=${spaceKey} and type=page`;
  const dropdownKey = 'stored';

  
  const container = AJS.$('#app').get(0);
  const target = AJS.$('#target').get(0);
  const jsx: JSX.Element[] = [];
  const App = () => <div>
  <div className="aui-buttons">
    <button className="aui-button" onClick={ () => { testList( target ) } } >Hello</button>
    <button className="aui-button" onClick={ () => { testContentProperty( baseUrl, pageId, key ) } } >Content Property</button>
    <button className="aui-button" onClick={ () => { testContentPropertyCql( baseUrl, cql, key ) } } >CQL</button>
    <button className="aui-button" onClick={ () => { testRestApi( baseUrl, pageId, key, cql ) } } >REST API</button>
    <button className="aui-button" onClick={ () => { testBuildDropdown( container, baseUrl, pageId, dropdownKey ) } } >BuildDropdown</button>
    <button className="aui-button" onClick={ () => { testContentPropertyCql( baseUrl, cql, dropdownKey ) } } >Dropdown CQL</button>
  </div>
  
  </div>;
  ReactDOM.render( <App/>, container );
} );

