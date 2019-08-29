import React, { Component } from 'react';
import * as ReactDOM from "react-dom";
import { Dropdown } from '../components';
import { Item, DropdownItem } from '../lib';

export interface Props {}

export interface State {
    selectedCid: string;
}
export class App extends React.Component<Props,State> {
    constructor( public prop: Props ) {
         super( prop );
         this.state = {
             selectedCid: AJS.params.pageId
         };
    }
    
    componentDidMount() {}
    componentWillUnmount() {}

    render() {
        return <form className="aui">
            <div className="field-group">
                <label>PageId<span className="aui-icon icon-required">required</span></label>
                <input className="text" type="text"
                       value={ this.state.selectedCid }
                       onChange={ ( e ) => { this.setState( { selectedCid: e.target.value } ) } }/>
                <div className="description">ドロップダウンの元データを取得するページIDを指定する。</div>
            </div>
            <div className="buttons-container"><div className="buttons">
                <input className="button submit" type="submit" value="Save" id="comment-save-button"/>
            </div></div>
        </form>;
    }
}

