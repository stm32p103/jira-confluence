import React, { Component } from 'react';
import * as ReactDOM from "react-dom";
import { testContentProperty, testRestApi } from './sample';

import { AJSRestAPI, Request } from './lib';

AJS.$(document).ready( async () => {
    const baseUrl = AJS.params.baseUrl;
    const pageId = AJS.params.pageId;
    const key = 'sample';
    const cql = 'space=TEST and type=page';
    const container = AJS.$('#app').get(0);
    const jsx: JSX.Element[] = [];
    
    
    const App = () => <div className="aui-buttons">
    <button className="aui-button" onClick={ () => { testContentProperty( baseUrl, pageId, key, cql ) } } >Content Property</button>
    <button className="aui-button" onClick={ () => { testRestApi( baseUrl, pageId, key, cql ) } } >REST API</button>
    </div>;
    
    ReactDOM.render( <App/>, container );
} );
