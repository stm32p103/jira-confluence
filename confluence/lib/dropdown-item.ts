export interface Item {
    label: string;
    value: string;
    items?: Item[];
}

/* ----------------------------------------------------------------------------
 * 以下の要素をデータ化する
 * <dropdown>
 *     <item></item>
 *     <item></item>
 *     <item></item>
 * </dropdown>
 * ------------------------------------------------------------------------- */
export class DropdownItem {
    private items: Item[];
    constructor( root: Element ){ 
        this.fromElement( root );
    }

    private fromElement( root: Element ) {
        if( root.tagName.toLowerCase() !== 'dropdown' ) {
            throw new Error( 'Provided element is not dropdown.' );
        }
        
        let items: Item[] = [];
        for( let i = 0; i < root.children.length; i++ ) {
            let item = this.elementToItem( root.children[i] );
            
            if( item ) {
                items.push( item );
            }
        }
        this.items = items;
    }
    
    private elementToItem( item: Element ): Item {
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

    getItems(): Item[] { return [].concat( this.items ) }
}
