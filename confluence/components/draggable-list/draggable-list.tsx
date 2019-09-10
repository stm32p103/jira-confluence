import React from "react";
import ReactDOM from "react-dom";

const DATA_TYPE = 'text/my-data';

export interface ListItem {
  key: string;
  label: string;
}

interface Props {
  items: ListItem[];
  selections: string[];
  onChange: ( selections: string[] ) => void;
}

export class List extends React.Component<Props> {
  constructor( props: Props ) {
    super( props );
  }
  
  onInsert( key: string, index: number ) {
    const keyIndex = this.props.selections.indexOf( key );
    // invalid index or no change
    if( keyIndex < 0 || keyIndex == index ) {
      return;
    }
    
    const selected = this.props.selections[keyIndex];
    const left = this.props.selections.slice( 0, keyIndex );
    const right = this.props.selections.slice( keyIndex+1 );
    
    const res = left.concat( right );
    const pos = ( keyIndex < index ) ? index-1 : index;
    res.splice( pos, 0, selected );

    this.props.onChange( res );
  }
  
  render() {
    return <div>{
      this.props.selections.map( ( selection, index ) => {
        return <>
          <Dropzone index={index} onDrop={( k, i ) => this.onInsert(k,i)} />
          <DraggableItem item={this.props.items.find( item => item.key == selection ) }/>
        </> } ) }
      <Dropzone index={this.props.items.length} onDrop={this.onInsert.bind(this)} /></div>;
  }
}

interface DropzoneProps {
  index: number;
  onDrop: ( key: string, index: number ) => void;
}

export class Dropzone extends React.Component<DropzoneProps> {
  private element: React.RefObject<any>;
  private readonly dropListener: any;
  constructor( props: DropzoneProps ) {
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
    const key = ev.dataTransfer.getData( DATA_TYPE );
//    console.log( 'dropped...' + key );
    this.props.onDrop( key, this.props.index );
  }
  
  render() {
    return <div ref={this.element}
                onDragEnter={ ev => this.checkEnter( ev ) }
                onDragOver={ ev => this.checkDrag( ev ) } >[---------------------------------]</div>
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
//    console.log('moving...' + this.props.item.key );
    ev.dataTransfer.setData( DATA_TYPE, this.props.item.key );
    ev.dataTransfer.effectAllowed = "move";
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
