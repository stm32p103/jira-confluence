import React from 'react';
import ReactDOM from 'react-dom';
import { AJSRestAPI, Request } from '@this/common';
import { ContentPropertyAPI } from './lib/api';
import { AppView, Controller} from './app/app'
$(document).ready( () => {
  const baseUrl = AJS.params.baseUrl;
  const cid = AJS.params.pageId;
  const ajsRest = new AJSRestAPI( baseUrl );
  const api = new ContentPropertyAPI( ajsRest );
  const controller = new Controller( api );
  
  console.log( cid );
  const container = $('#app');
  ReactDOM.render( <AppView controller={controller} cid={cid}/>, container.get(0) );
} );