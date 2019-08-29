import React from 'react';
import * as ReactDOM from "react-dom";
import { testContentProperty, testRestApi, testDom } from './sample';

import { AJSRestAPI, Request } from './lib';

AJS.$(document).ready( async () => {
    const baseUrl = AJS.params.baseUrl;
    const pageId = AJS.params.pageId;
    const key = 'sample';
    const cql = 'space=TEST and type=page';
    const container = AJS.$('#app').get(0);
    const jsx: JSX.Element[] = [];
    
    const App = () => <div>
        <div className="aui-buttons">
            <button className="aui-button" onClick={ () => { testContentProperty( baseUrl, pageId, key, cql ) } } >Content Property</button>
            <button className="aui-button" onClick={ () => { testRestApi( baseUrl, pageId, key, cql ) } } >REST API</button>
            <button className="aui-button" onClick={ () => { testDom( AJS.$('#target').get(0) ) } } >Tree</button>
        </div>
        <div id="target"></div>
    </div>;
    
    ReactDOM.render( <App/>, container );
} );
