import React from 'react';
import ReactDOM from 'react-dom';
import { AJSRestAPI } from './common';
import { ContentPropertyAPI } from './lib/api';
import { AppView, Controller} from './app/app'

import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { Action } from 'typescript-fsa';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';

// action: do what
const actionCreator = actionCreatorFactory();
export const hogeActions = {
  updateName: actionCreator<string>('ACTIONS_UPDATE_NAME'),
  updateEmail: actionCreator<string>('ACTIONS_UPDATE_EMAIL')
};



// state: state
export interface HogeState {
  name: string;
  email: string;
}

const initialState: HogeState = {
  name: '',
  email: ''
};

// transition
export const hogeReducer = reducerWithInitialState(initialState)
  .case(hogeActions.updateName, (state, name) => {
    return Object.assign({}, state, { name });
  })
  .case(hogeActions.updateEmail, (state, email) => {
    return Object.assign({}, state, { email });
  });


// app: integrate
import { createStore, combineReducers } from 'redux';

export type AppState = {
  hoge: HogeState
};

const Store = createStore(
  combineReducers<AppState>({
    hoge: hogeReducer
  })
);


interface OwnProps {}
type HogeProps = OwnProps & HogeState & HogeActions;

export const HogeComponent: React.SFC<HogeProps> = (props: HogeProps) => {
  return (
    <div>
      <div className="field">
        <input
          type="text"
          placeholder="name"
          value={props.name}
          onChange={(e) => props.updateName(e.target.value)}
        />
      </div>
      <div className="field">
        <input
          type="email"
          placeholder="email"
          value={props.email}
          onChange={(e) => props.updateEmail(e.target.value)}
        />
      </div>
    </div>
  );
};



// Container: components behaviorhttps://qiita.com/enshi/items/19b1924b72f8c2ffd1eb
export interface HogeActions {
  updateName: (v: string) => Action<string>;
  updateEmail: (v: string) => Action<string>;
}

function mapDispatchToProps(dispatch: Dispatch<Action<string>>) {
  return {
    updateName: (v: string) => dispatch(hogeActions.updateName(v)),
    updateEmail: (v: string) => dispatch(hogeActions.updateEmail(v))
  };
}

function mapStateToProps(appState: AppState) {
  return Object.assign({}, appState.hoge);
}

const HogeContainer = connect(mapStateToProps, mapDispatchToProps)(HogeComponent);







import { Provider } from 'react-redux';








$(document).ready( () => {
  const container = $('#app');
//  const baseUrl = AJS.params.baseUrl;
//  const cid = AJS.params.pageId;
//  const api = new ContentPropertyAPI( new AJSRestAPI( baseUrl ) );
//  const controller = new Controller( api );
//  ReactDOM.render( <AppView controller={controller} cid={cid}/>, container.get(0) );
  ReactDOM.render( <Provider store={Store}>
    <HogeContainer  />
  </Provider>, container.get(0) );
} );
