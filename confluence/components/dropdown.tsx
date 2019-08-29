//import * as React from "react";
//import { Item } from '../lib';
//
//interface Props {
//    id: string;
//    items: Item[];
//}
//
//interface State {
//    selected: string;
//}
//
///* ----------------------------------------------------------------------------
// * DropdownItemの情報をもとに、ドロップダウンを作る
// * ------------------------------------------------------------------------- */
//export class Dropdown extends React.Component<Props,State> {
//    constructor( public prop: Props ) {
//        super( prop );
//        this.state = {
//            selected: prop.items[0].value
//        };
//   }
//   componentDidMount() {}
//   componentWillUnmount() {}
//    /* ------------------------------------------------------------------------
//     * 再起呼び出しで選択肢を作る
//     * 複数階層は未対応。オーバーロードすると、独自の形式で出力できる。
//     * --------------------------------------------------------------------- */
//    protected itemsToJsxElements( items: Item[], depth: number ): JSX.Element[] {
//        let result = items.map( item => {
//            let elem: JSX.Element;
//        
//            if( item.items.length > 0 && depth < 1 ) {
//                elem = <optgroup label={item.label}>{ this.itemsToJsxElements( item.items, depth+1 ) }</optgroup>
//            } else {
//                elem = <option value={item.value} >{item.label}</option>                                
//            }
//            return elem;
//        } ).filter( item => item !== undefined );
//        return result;
//    }
//    
//    protected toJsx(): JSX.Element[] {
//        return this.itemsToJsxElements( this.prop.items, 0 );
//    }
//    
//    render() {
//        return <select id={this.prop.id} onChange={ (e)=> { this.setState( { selected: e.target.value } ) } } >{this.toJsx()}</select>
//    }
//}
