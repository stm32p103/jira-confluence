/* ----------------------------------------------------------------------------
 * 要素を走査する
 * ------------------------------------------------------------------------- */
export function scan<T>( root: Element, transform: ( item: Element, children: T[] ) => T ) {
    let children: T[] = [];

    for( let i = 0; i < root.children.length; i++ ) {
        const child = root.children[i];
        const item = scan( child, transform );
        if( item ) {
            children.push( item );            
        }
    }
    
    return transform( root, children );
}
