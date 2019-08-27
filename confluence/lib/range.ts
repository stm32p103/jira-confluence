/* ----------------------------------------------------------------------------
 * REST APIのページネーションで使う表示範囲
 * ページネーションでは開始位置と最大取得数しか指定・取得できない
 * ------------------------------------------------------------------------- */
export class Range {
    readonly start: number;
    readonly limit: number;
    readonly size?: number;
    constructor( range: Partial<Range> = { start: 0, limit: 25 } ) {
         Object.assign( this, range );
    }
    
    next( limit?: number ): Range {
        if( limit === undefined ) {
            limit = this.limit;
        }
        let start = this.start + limit;

        let range: Range = null;
        if( start < limit ) {
            range = new Range( { start: start, limit: limit } );
        }
        
        return range; 
    }
}
