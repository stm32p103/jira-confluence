import { Range } from './range';

interface Refererence {
    cid?: string;
    key?: string;
}

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

export class ContentPropertyAccessor {
    /* ------------------------------------------------------------------------
     * base: AJS.params.baseUrlから取得すると良い
     * --------------------------------------------------------------------- */
    constructor( private base: string ) {}
    
	/* ------------------------------------------------------------------------
	 * URLを作る
	 * --------------------------------------------------------------------- */
	private toUrl( ref: Refererence, param?: any ) {
	    let url = [ this.base, 'rest/api/content', ref.cid, 'property' ].join( '/' );
	    
	    if( ref.key ) {
	        url = url + '/' + ref.key;
	    }
	    
	    url = url + this.toQueryString( param );
	    return url;
	}
    /* ------------------------------------------------------------------------
     * 検索URLを作る
     * --------------------------------------------------------------------- */
	private searchUrl( param: any ) {
        let url = [ this.base, 'rest/api/content/search' ].join( '/' ) + this.toQueryString( param );
        return url;
	}

    /* ------------------------------------------------------------------------
     * データを成型する
     * --------------------------------------------------------------------- */
	private format( cid: string, result: any ): ContentProperty {
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
    /* ------------------------------------------------------------------------
     * クエリ文字列を作る
     * --------------------------------------------------------------------- */
	private toQueryString( param: any ) {
	    let res  = '';
	    if( param ) {
	        let q = [];
	        for( let key in param ) {
	            q.push( key + '=' + param[ key ] );
	        }

	        if( q.length > 0 ) {
	            res = res + '?' + q.join( '&' );
	        }
	    }
	    return res;
	}
    /* ------------------------------------------------------------------------
     * ｊQueryを使ってリクエストする(ここだけAJSに依存)
     * --------------------------------------------------------------------- */
	private async request( method: string, url: string, data?: any ) {
        let response;
	    let option: any = {
            url: url,
            type: method,
            success: ( res ) => {
                response = res;
        } };
	    
	    if( data !== undefined ) {
	        option.data = JSON.stringify( data );
	        option.headers = {
                'Content-Type': 'application/json'
            }
	    }
	    await AJS.$.ajax( option );
	    return response;
	}
	
	/* ------------------------------------------------------------------------
	 * 全てのプロパティを取得する(REST API)
	 * https://docs.atlassian.com/ConfluenceServer/rest/6.15.7/#api/content/{id}/property-findAll
	 * --------------------------------------------------------------------- */
	private async restFindAll( cid: string, param: any = {}  ) {
		let response;
		const url = this.toUrl( { cid: cid }, param );
		try {
		    response = await this.request( 'get', url );					
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
        const url = this.toUrl( { cid: cid, key: key }, param );
        try { 
            response = await this.request( 'get', url );
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
        const url = this.toUrl( { cid: cid } );
        let response = await this.request( 'post', url, { key: key, value: value } );
        return response;
    }
    /* ------------------------------------------------------------------------
     * key を value で更新する。バージョンは数字で指定する。(過去と同じ値だとエラー)
     * https://docs.atlassian.com/ConfluenceServer/rest/6.15.7/#api/content/{id}/property-update
     * --------------------------------------------------------------------- */
	private async restUpdate( cid: string, key: string, value: any, version: number ) {
        const url = this.toUrl( { cid: cid, key: key } );
        let response = await this.request( 'put', url, { key: key, value: value, version: { number: version } } );
        return response;
    }
    /* ------------------------------------------------------------------------
     * keyを削除。
     * 404 NOT FOUND はエラーとみなさない。
     * https://docs.atlassian.com/ConfluenceServer/rest/6.15.7/#api/content/{id}/property-delete
     * --------------------------------------------------------------------- */
	private async restDelete( cid: string, key: string ) {
        const url = this.toUrl( { cid: cid, key: key } );
        try {
            await this.request( 'delete', url );
        } catch( err ) {            
            if( err.status !== 404 ) {
                throw new Error( err );
            }
        }
    }
    /* ------------------------------------------------------------------------
     * 検索
     * https://docs.atlassian.com/ConfluenceServer/rest/6.15.7/#api/content-search
     * 更新日把握のため versionも取得する。もう少し拡張性のある書き方にしたい。
     * --------------------------------------------------------------------- */
    private async restSearch( cql: string, key: string, param: any )  {
        let response = null;
        const url = this.searchUrl( param );
        try {
            response = await this.request( 'get', url )
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
		let list: ContentProperty[] = response.results.map( result => this.format( cid, result ) );
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
    async getByCql( cql: string, key: string, range: Range = new Range()): Promise<ContentPropertyList> {
        let response = await this.restSearch( cql, key, { 
            cql: cql,
            expand: 'version,metadata.properties.' + key,
            start: range.start,
            limit: range.limit
        } );
        let list: ContentProperty[] = response.results
                                              .filter( result => result.metadata.properties[ key ] !== undefined )
                                              .map( result => this.format( result.id, result.metadata.properties[ key ] ) );
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
		
		return this.format( cid, result );
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
        return this.format( cid, result );
	}

    /* ------------------------------------------------------------------------
     * keyを削除する。
     * 一括削除はAPIが無いため、負荷を抑えるために1つずつ削除する。
     * --------------------------------------------------------------------- */
	async delete( cid: string, key: string ) {
	    await this.restDelete( cid, key );
	}
}

