/* ------------------------------------------------------------------------
 * クエリパラメータを文字列にする
 * --------------------------------------------------------------------- */
export function queryToString( query: { [key: string]: string } = {} ) {
    let tmp = '';
    const keys = Object.keys( query );
    
    if( keys.length > 0 ) {
        tmp = '?' + keys.map( key => key + '=' + query[ key ] ).join( '&' );
    }
    return tmp;
}
