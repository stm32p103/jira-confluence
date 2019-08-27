import React, { Component } from 'react';
import * as ReactDOM from "react-dom";

import { ContentPropertyAccessor } from './lib';
import { DropdownItem } from './components';
import { App } from './app/app';

export interface Props {
    content: string;
}

AJS.$(document).ready( async () => {
    const cid = AJS.params.pageId;
    const key = 'sample';
    const target = AJS.$('#app').get(0);

    const app = new App( { pageId: 'a' } );
    ReactDOM.render( app.render(), target  as Element );
    
} )

