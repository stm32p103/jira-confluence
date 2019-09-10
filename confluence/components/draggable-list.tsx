import React from "react";
import ReactDOM from "react-dom";

/* Confluence上でドラッグアンドドロップを実現するために、DOMイベントを利用する。 */

const DATA_TYPE = 'text/my-data';

export interface ListItem {
  key: string;
  label: string;
}

interface Props {
  items: ListItem[];
}

export class List extends React.Component<Props> {
  constructor( props: Props ) {
    super( props );
  }
  
  render() {
    return <div><Dropzone/>{this.props.items.map( item => <><DraggableItem item={item} /><Dropzone/></> ) }</div>;
  }
}

export class Dropzone extends React.Component {
  private element: React.RefObject<any>;
  private readonly dropListener: any;
  constructor( props: {} ) {
    super( props );
    this.element = React.createRef();
    this.dropListener = this.dropped.bind( this );
  }
  
  checkDrag( ev: React.DragEvent<HTMLDivElement> ) {
    ev.preventDefault();
  }
  
  checkEnter( ev: React.DragEvent<HTMLDivElement> ) {
    ev.dataTransfer.dropEffect = 'move';
    ev.preventDefault();
  }
  
  componentDidMount() {
    this.element.current.addEventListener( 'drop', this.dropListener );
  }
  
  componentWillUnmount() {
    this.element.current.removeEventListener( 'drop', this.dropListener );
  }
  
  dropped( ev: React.DragEvent<HTMLDivElement> ) {
    const data = ev.dataTransfer.getData( DATA_TYPE );
    console.log( data );
  }
  
  render() {
    return <div ref={this.element}
                onDragEnter={ ev => this.checkEnter( ev ) }
                onDragOver={ ev => this.checkDrag( ev ) } >[drop]</div>
  }
}

interface ListItemProps {
  item: ListItem;
}

export class DraggableItem extends React.Component<ListItemProps> {
  constructor( props: ListItemProps ) {
    super( props );
  }
  
  onDragStart( ev: React.DragEvent<HTMLDivElement> ) {
    ev.dataTransfer.setData( DATA_TYPE, this.props.item.key );
    ev.dataTransfer.effectAllowed = "copy";
  }
  
  onDragEnd( ev: React.DragEvent<HTMLDivElement> ) {
    console.log(ev.dataTransfer.dropEffect);
  }
  
  render() { 
    return <div draggable
               key={this.props.item.key}
               onDragStart ={ ev => this.onDragStart(ev) }
               onDragEnd={ ev => this.onDragEnd(ev) }>{this.props.item.label}</div>;
  }
}


export function testList( target: HTMLElement ) {
  const items: ListItem[] = [ 
    { key: 'aaa', label: 'AAA' },  
    { key: 'bbb', label: 'BBB' },
    { key: 'ccc', label: 'CCC' },
  ];
  
  ReactDOM.render( <List items={items}/>, target );
}
