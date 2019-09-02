import * as React from "react";

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
  items: Item[];
  value: string;
  onChange?: ( value: string ) => void;
}

/* ----------------------------------------------------------------------------
 * valueはStateではないためプロパティに移動
 * (inputも値はプロパティ)
 * ------------------------------------------------------------------------- */
interface State {}

/* ----------------------------------------------------------------------------
 * DropdownItemの情報をもとに、ドロップダウンを作る
 * ------------------------------------------------------------------------- */
export class Dropdown extends React.Component<Props,State> {
  state: State;
  constructor( public props: Props ) {
    super( props );
  }

  /* --------------------------------------------------------------------------
   * 選択肢の生成
   * ----------------------------------------------------------------------- */
  private options() {
    return this.props.items.map( ( item, index ) => <option value={item.value} key={item.value}>{item.label}</option> );
  }
  
  render() {
    return <form className="aui">
           <select className="select"
                   value={ this.props.value }
                   onChange={ (e)=> { this.props.onChange( e.target.value ) } }>{ this.options() }</select>
           </form>
  }
}

