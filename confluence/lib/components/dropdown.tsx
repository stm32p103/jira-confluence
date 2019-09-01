import * as React from "react";
import { Serializable, Serializer } from '../storage';

/* ----------------------------------------------------------------------------
 * ドロップダウンを構成する選択肢。
 * 暫定的に単一レベルのみに対応。
 * マルチレベルには別コンポーネントで対応する。
 * かなり多い見込みのため、テーブルの方が良さそう。
 * ------------------------------------------------------------------------- */
export interface Item {
    label: string;
    value: string;
}

/* ----------------------------------------------------------------------------
 * React.Component のプロパティとステート
 * ------------------------------------------------------------------------- */
interface Props {
  id: string;
  items: Item[];
  serializer?: Serializer;
  getter?: ( value: string ) => any;
  setter?: ( data: any ) => string;
}

interface State {
    value: string;
}

/* ----------------------------------------------------------------------------
 * DropdownItemの情報をもとに、ドロップダウンを作る
 * ------------------------------------------------------------------------- */
export class Dropdown extends React.Component<Props,State> implements Serializable {
  state: State;
  constructor( public props: Props ) {
    super( props );
    
    // tetntative initial value
    this.state = { value: props.items[0].value };
  }

  /* --------------------------------------------------------------------------
   * SerializableのInterface。定型。
   * 切り出し他方が良いと思う。
   * 型の使い方がうまくないので改善する。
   * 受け渡し時に加工できるようにしている
   * ----------------------------------------------------------------------- */
  get() {
    let value = this.state.value;
    if( this.props.getter ) {
      return this.props.getter( value );
    } else {
      return value;      
    }
  }
  set( value: any ) {
    if( this.props.setter ) {
      value = this.props.setter( value ); 
    }
    this.update( value );
  }
  componentDidMount() {
    if( this.props.serializer ) {
      this.props.serializer.register( this.props.id, this );      
    }
  }
  componentWillUnmount() {
    if( this.props.serializer ) {
      this.props.serializer.unregister( this.props.id ); 
    }
  }

  /* --------------------------------------------------------------------------
   * 選択肢の生成
   * ----------------------------------------------------------------------- */
  private options() {
    // key should be assigned.
    return this.props.items.map( ( item, index ) => <option value={item.value} key={item.value}>{item.label}</option> );
  }
  
  update( value: string ) {
    this.setState( { value: value } );
  }
 
  render() {
    return <form className="aui">
    <select className="select"
            id={ this.props.id }
            value={ this.state.value }
            onChange={ (e)=> { this.update( e.target.value ) } }>{ this.options() }</select>
    </form>
  }
}
