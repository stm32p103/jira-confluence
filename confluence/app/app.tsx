import React, { Component } from 'react';

export interface Props {
    pageId: string;
}

export interface State {
    selectedCid: string;
}

export class App extends React.Component<Props,State> {
    state: State;
    constructor( public prop: Props ) {
         super( prop );
         this.state = {
             selectedCid: this.props.pageId
         };
    }
    
    componentDidMount() {}
    componentWillUnmount() {}

    render() {
        return <form className="aui">
    <div className="field-group">
        <label>Default field<span className="aui-icon icon-required">required</span></label>
        <input className="text" type="text" id="text-input" name="text-input" title="Text input"/>
        <div className="description">Default width input of a required field</div>
    </div>
    <Button/>
</form>;
    }
}

const Button = (props) => <div className="buttons-container"><div className="buttons">
                            <input className="button submit" type="submit" value="Save" id="comment-save-button"/>
                          </div></div>;