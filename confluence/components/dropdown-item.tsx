import * as React from "react";

export interface Item {
    label: string;
    value: string;
    items: Item[];
}

export class DropdownItem {
    private items: Item[];

    constructor( root?: Element ) {
        if( root ) {
            this.fromElement( root );
        } else {
            this.items = [];
        }
    }

    fromItem( items: Item[] ) {
        this.items = items;
    }
    
    fromElement( root: Element ) {
        if( root.tagName.toLowerCase() !== 'dropdown' ) {
            throw new Error( 'Provided element is not dropdown' );
        }
        
        let items: Item[] = [];
        for( let i = 0; i < root.children.length; i++ ) {
            console.log( root );
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
    
    private itemsToJsxElements( items: Item[] ): JSX.Element[] {
        let result = items.map( item => {
            let elem: JSX.Element;
            if( item.items.length > 0 ) {
                elem = <optgroup label="{item.label}">{ this.itemsToJsxElements( item.items ) }</optgroup>
            } else {
                elem = <option value={item.value} >{item.label}</option>                                
            }
            return elem;
        } )
        return result;
    }
    
    getItem(): Item[] {
        return this.items;
    }
    
    toJsx(): JSX.Element[] {
        return this.itemsToJsxElements( this.items );
    }
}
