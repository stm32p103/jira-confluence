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
 * たったこれだけだった.
 * auiの見た目に併せたければ <form class="aui">の下に置く必要がある。
 * ------------------------------------------------------------------------- */
const Options = ( props: { items: Item[] } ) => <>{ props.items.map( item => <option value={item.value} key={item.value}>{item.label}</option> ) }</>;
export const Dropdown = ( props: Props ) => <select className="select" value={ props.value } onChange={ (e)=> { props.onChange( e.target.value ) } }><Options items={props.items} /></select>;
