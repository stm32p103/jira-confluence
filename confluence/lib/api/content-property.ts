import { Range } from './range';
import { RestAPI, Request } from '../request';

export interface ContentProperty {
    cid: string;
    id: string;
    key: string;
    value: any;
    version: {
        when: Date;
        number: number;
    }
}

export interface ContentPropertyList {
    results: ContentProperty[];
    range: Range;
}

function apiUrl( cid: string, key?: string ) {
    let url = [ '/rest/api/content', cid, 'property' ].join( '/' );
    
    if( key ) {
        url = url + '/' + key;
    }
    
    return url;
}

/* ------------------------------------------------------------------------
 * クエリパラメータを文字列にする
 * --------------------------------------------------------------------- */
function queryToString( query: { [key: string]: string } = {} ) {
    let tmp = '';
    const keys = Object.keys( query );
    
    if( keys.length > 0 ) {
        tmp = '?' + keys.map( key => key + '=' + query[ key ] ).join( '&' );
    }
    return tmp;
}


/* ------------------------------------------------------------------------
 * 受け取ったデータを整形する
 * --------------------------------------------------------------------- */
function format( cid: string, result: any ): ContentProperty {
    let tmp = null;
    if( result !== null ) {
        tmp = {
            cid: cid,
            id: result.id,
            key: result.key,
            value: result.value,
            version: {
                when: result.version.when,
                number: result.version.number
            }
        };
    }
    return tmp;
}

export class ContentPropertyAPI {
    /* ------------------------------------------------------------------------
     * Dependency Injection
     * --------------------------------------------------------------------- */
    constructor( private readonly api: RestAPI ) {}
    
	/* ------------------------------------------------------------------------
	 * 全てのプロパティを取得する(REST API)
	 * https://docs.atlassian.com/ConfluenceServer/rest/6.15.7/#api/content/{id}/property-findAll
	 * --------------------------------------------------------------------- */
	private async restFindAll( cid: string, param: any = {} ) {
		let response;
		const req = Request.get( apiUrl( cid ) + queryToString( param ) );
		try {
		    response = await this.api.request( req );					
		} catch( err ) {
			if( err.status === 404 ) {
				response = null;
			} else {
				throw new Error( err );
			}
		}
		return response;
	}

	/* ------------------------------------------------------------------------
	 * key の値を取得する。(REST API)
	 * https://docs.atlassian.com/ConfluenceServer/rest/6.15.7/#api/content/{id}/property-findByKey
	 * --------------------------------------------------------------------- */
	private async restFindByKey( cid: string, key: string, param: any = {} ) {
        let response;
        const req = Request.get( apiUrl( cid, key ) + queryToString( param ) );
        
        try { 
            response = await this.api.request( req );
        } catch( err ) {
            if( err.status === 404 ) {
                response = null;
            } else {
                throw new Error( err );
            }
        }
        
        return response;
	}
	
	/* ------------------------------------------------------------------------
     * key を value で新規作成する。
     * https://docs.atlassian.com/ConfluenceServer/rest/6.15.7/#api/content/{id}/property-create
     * --------------------------------------------------------------------- */
	private async restCreate( cid: string, key: string, value: any ) {
        const req = Request.post( apiUrl( cid ) );
        req.attatchData( { key: key, value: value } );

        let response;
        try {
            response = await this.api.request( req );            
        } catch ( err ) {
            console.log( err );
        }
        return response;
    }
    /* ------------------------------------------------------------------------
     * key を value で更新する。バージョンは数字で指定する。(過去と同じ値だとエラー)
     * https://docs.atlassian.com/ConfluenceServer/rest/6.15.7/#api/content/{id}/property-update
     * --------------------------------------------------------------------- */
	private async restUpdate( cid: string, key: string, value: any, version: number ) {
        const req = Request.put( apiUrl( cid, key ) );
        req.attatchData( { key: key, value: value, version: { number: version } } );
        let response = await this.api.request( req );
        return response;
    }
    /* ------------------------------------------------------------------------
     * keyを削除。
     * 404 NOT FOUND はエラーとみなさない。
     * https://docs.atlassian.com/ConfluenceServer/rest/6.15.7/#api/content/{id}/property-delete
     * --------------------------------------------------------------------- */
	private async restDelete( cid: string, key: string ) {
        const req = Request.delete( apiUrl( cid, key ) );
        try {
            let response = await this.api.request( req );
            await this.api.request( req );
        } catch( err ) {            
            if( err.status  == 404 ) {
                throw new Error( err );
            }
        }
    }
    /* ------------------------------------------------------------------------
     * 検索
     * https://docs.atlassian.com/ConfluenceServer/rest/6.15.7/#api/content-search
     * 更新日把握のため versionも取得する。もう少し拡張性のある書き方にしたい。
     * --------------------------------------------------------------------- */
    private async restSearch( param: any = {} )  {
        let response = null;
        const url = '/rest/api/content/search';
        const req = Request.get( url + queryToString( param ) );
        try {
            response = await this.api.request( req );
        } catch( err ) {
            // invalid cql -> null. other -> err.            
            if( err.status !== 400 ) {
                throw new Error( err );
            }
        }
        return response;
    }
	/* ------------------------------------------------------------------------
	 * 全てのプロパティを取得する
	 * --------------------------------------------------------------------- */
	async getAll( cid: string, range: Range = new Range() ): Promise<ContentPropertyList> {
		let response = await this.restFindAll( cid, { start: range.start, limit: range.limit } );
		let list: ContentProperty[] = response.results.map( result => format( cid, result ) );
		return {
		    results: list,
            range: new Range( {
                start: response.start,
                limit: response.limit,
                size: response.size
            } )
		};
	} 

    /* ------------------------------------------------------------------------
     * CQLに該当するプロパティを取得する
     * --------------------------------------------------------------------- */
    async getByCql( cql: string, key: string, range: Range = new Range() ): Promise<ContentPropertyList> {
        let response = await this.restSearch( {
            cql: cql,
            expand: 'version,metadata.properties.' + key,
            start: range.start,
            limit: range.limit
        } );
        
        console.log( response );
        
        let list: ContentProperty[] = response.results
                                              .filter( result => result.metadata.properties[ key ] !== undefined )
                                              .map( result => format( result.id, result.metadata.properties[ key ] ) );
        return {
            results: list,
            range: new Range( {
                start: response.start,
                limit: response.limit,
                size: response.size
            } )
        };
    } 
    
	/* ------------------------------------------------------------------------
	 * key の値を取得する。
	 * --------------------------------------------------------------------- */
	async get( cid: string, key: string ): Promise<ContentProperty> {
		let result = await this.restFindByKey( cid, key );
		
		return format( cid, result );
	}
	
	/* ------------------------------------------------------------------------
	 * key が存在していなかったら新規作成、存在していたらバージョンを1つ挙げて更新する。
	 * リクエストが1回余計に必要なのは、例えば投機的にUpdateしてNGならCreateするよう改善する。
	 * Updateをするために、newVersionを使うため予約するが、今は使わない
	 * --------------------------------------------------------------------- */
	async set( cid: string, key: string, value: any ): Promise<ContentProperty> {
		const latest = await this.restFindByKey( cid, key, { expand: 'version' } );
		let result;
		if( latest !== null ) {
			const version = 1 + latest.version.number;
			result = await this.restUpdate( cid, key, value, version );
		} else {
		    result = await this.restCreate( cid, key, value );
		}
        return format( cid, result );
	}

    /* ------------------------------------------------------------------------
     * keyを削除する。
     * 一括削除はAPIが無いため、負荷を抑えるために1つずつ削除する。
     * --------------------------------------------------------------------- */
	async delete( cid: string, key: string ) {
	    await this.restDelete( cid, key );
	}
}

