import React from "react";
import ReactDOM from "react-dom";

export interface ListItem {
  key: string;
  label: string;
}

export const List = ( props: { items: ListItem[] } ) => <ul>{props.items.map( item => <ListItem item={item} /> ) }</ul>;
export const ListItem = ( props: { item: ListItem } ) => <li key={props.item.key}>{props.item.label}</li>;

export function testList( target: HTMLElement ) {
  const items: ListItem[] = [ 
    { key: 'aaa', label: 'AAA' },  
    { key: 'bbb', label: 'BBB' },
    { key: 'ccc', label: 'CCC' },
  ];
  
  ReactDOM.render( <List items={items}/>, target );
}