import * as React from "react";

export interface Item {
    label: string;
    value: string;
    items: Item[];
}

/* ----------------------------------------------------------------------------
 * base: AJS.params.baseUrlから取得すると良い
 * ------------------------------------------------------------------------- */
export class DropdownItem {
    static fromElement( root: Element ) {
        if( root.tagName.toLowerCase() !== 'dropdown' ) {
            throw new Error( 'Provided element is not dropdown.' );
        }
        
        let items: Item[] = [];
        for( let i = 0; i < root.children.length; i++ ) {
            let item = DropdownItem.elementToItem( root.children[i] );
            
            if( item ) {
                items.push( item );
            }
        }
        return items;
    }
    
    private static elementToItem( item: Element ): Item {
        if( item.tagName.toLowerCase() !== 'item' ) {
            return null;
        }
        
        let subs: Item[] = [];
        for( let i = 0; i < item.children.length; i++ ) {
            // TENTATIVE: recursive call
            let sub = this.elementToItem( item.children[i] );
            
            if( sub ) {
                subs.push( sub );
            }
        }

        let result: Item = {
            label: ( item.getAttribute( 'label' ) || '' ),
            value: ( item.getAttribute( 'value' ) || '' ),
            items: subs
        }
        
        return result;
    }
    private items: Item[];
    constructor( items: Item[] ){ this.setItems( items ) }
    setItems( items: Item[] ) { this.items = [].concat( items ) }
    getItems(): Item[] { return [].concat( this.items ) }

    /* ------------------------------------------------------------------------
     * 再起呼び出しで選択肢を作る
     * 複数階層は未対応。オーバーロードすると、独自の形式で出力できる。
     * --------------------------------------------------------------------- */
   protected itemsToJsxElements( items: Item[], depth: number ): JSX.Element[] {
       let result = items.map( item => {
           let elem: JSX.Element;
        
           if( item.items.length > 0 && depth < 1 ) {
               elem = <optgroup label={item.label}>{ this.itemsToJsxElements( item.items, depth+1 ) }</optgroup>
           } else {
               elem = <option value={item.value} >{item.label}</option>                                
           }
           return elem;
       } ).filter( item => item !== undefined );
       return result;
   }
    
    toJsx(): JSX.Element[] {
        return this.itemsToJsxElements( this.items, 0 );
    }
}
