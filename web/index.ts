import { ContentPropertyAPI } from '@this/common';
import { AJSRestAPI } from '@this/web';


AJS.$(document).ready( () => {
  const container = $('#app');
  const baseUrl = AJS.params.baseUrl;
  const cid = AJS.params.pageId;
  const api = new ContentPropertyAPI( new AJSRestAPI( baseUrl ) );
  
  console.log( AJS.params );
} );

