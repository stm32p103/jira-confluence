import React from 'react';
import ReactDOM from 'react-dom';
import { AJSRestAPI } from './common';
import { ContentPropertyAPI } from './lib/api';
import { AppView, Controller} from './app/app'
$(document).ready( () => {
  const baseUrl = AJS.params.baseUrl;
  const cid = AJS.params.pageId;
  const api = new ContentPropertyAPI( new AJSRestAPI( baseUrl ) );
  const controller = new Controller( api );
  
  const container = $('#app');
  ReactDOM.render( <AppView controller={controller} cid={cid}/>, container.get(0) );
} );
///https://stackoverflow.com/questions/3879959/velocity-template-and-javascript