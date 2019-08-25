type RestFindAllParam = {
    expand?: string;
    start?: number;
    limit?: number;
}

type RestFindByKeyParam = {
    expand?: string;
}

type ContentPropertyReferer = {
    cid: string;
    key?: string;
    param?: { [ key: string ]: any };
}

export interface ContentProperty {
    id: string;
    key: string;
    value: any;
    version: {
        when: Date;
        number: number;
    }
}

export interface Range {
    start: number;          // start index
    limit: number;          // element count
    size: number;           // max element count
}

export interface ContentPropertyList {
    map: { [key: string]: string };
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
	private toUrl( ref: ContentPropertyReferer ) {
	    let res = [ this.base, 'rest/api/content', ref.cid, 'property' ].join( '/' );
	    
	    if( ref.key ) {
	        res = res + '/' + ref.key;
	    }
	    
	    if( ref.param ) {
	        let q = [];
	        for( let key in ref.param ) {
	            q.push( key + '=' + ref.param[ key ] );
	        }

	        if( q.length > 0 ) {
	            res = res + '?' + q.join( ',' );
	        }
	    }
	    return res;
	}

    /* ------------------------------------------------------------------------
     * ｊQueryを使ってリクエストする(ここだけAJSに依存)
     * --------------------------------------------------------------------- */
	private async request( method: string, ref: ContentPropertyReferer, data?: any ) {
	    let url = this.toUrl( ref );
	    
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
	private async restFindAll( cid: string, param: RestFindAllParam = {} ) {
		let response;
		try {
		    response = await this.request( 'get', { cid: cid, param: param } );					
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
	private async restFindByKey( cid: string, key: string, param: RestFindByKeyParam = {} ) {
        let response;
        try { 
            response = await this.request( 'get', { cid: cid, key: key, param: param } );
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
        let response = await this.request( 'post', { cid: cid }, { key: key, value: value } );
        return response;
    }
    /* ------------------------------------------------------------------------
     * key を value で更新する。バージョンは数字で指定する。(過去と同じ値だとエラー)
     * https://docs.atlassian.com/ConfluenceServer/rest/6.15.7/#api/content/{id}/property-update
     * --------------------------------------------------------------------- */
    async restUpdate( cid: string, key: string, value: any, version: number ) {
        let response = await this.request( 'put', { cid: cid, key: key }, { key: key, value: value, version: { number: version } } );
        return response;
    }
    /* ------------------------------------------------------------------------
     * keyを削除。
     * 404 NOT FOUND はエラーとみなさない。
     * https://docs.atlassian.com/ConfluenceServer/rest/6.15.7/#api/content/{id}/property-delete
     * --------------------------------------------------------------------- */
    async restDelete( cid: string, key: string ) {
        try {
            await this.request( 'delete', { cid: cid, key: key } );
        } catch( err ) {            
            if( err.status !== 404 ) {
                throw new Error( err );
            }
        }
    }
	/* ------------------------------------------------------------------------
	 * 全てのプロパティを取得する
	 * TODO: Pagenationに対応する
	 * --------------------------------------------------------------------- */
	async getAll( cid: string ): Promise<ContentPropertyList> {
		let response = await this.restFindAll( cid );
		let map = {};

		response.results.map( kv => {
		    map[ kv.key ] = kv as ContentProperty;
		} )
		return {
		    map: map,
		    range: {
		        start: response.start,
		        limit: response.limit,
		        size: response.size
		    }
		};
	} 

	/* ------------------------------------------------------------------------
	 * key の値を取得する。
	 * --------------------------------------------------------------------- */
	async get( cid: string, key: string ): Promise<ContentProperty> {
		let response = await this.restFindByKey(cid, key );
		
		return response as ContentProperty;
	}
	
	/* ------------------------------------------------------------------------
	 * key が存在していなかったら新規作成、存在していたらバージョンを1つ挙げて更新する。
	 * リクエストが1回余計に必要なのは、例えば投機的にUpdateしてNGならCreateするよう改善する。
	 * Updateをするために、newVersionを使うため予約するが、今は使わない
	 * --------------------------------------------------------------------- */
	async set( cid: string, key: string, value: any ): Promise<ContentProperty> {
		const latest = await this.restFindByKey( cid, key, { 'expand': 'version' } );

		let response;
		if( latest !== null ) {
			const version = 1 + latest.version.number;
			response = this.restUpdate( cid, key, value, version );
		} else {
			response = this.restCreate( cid, key, value );
		}

        return response as ContentProperty;
	}

    /* ------------------------------------------------------------------------
     * keyを削除する。
     * 一括削除はAPIが無いため、負荷を抑えるために1つずつ削除する。
     * --------------------------------------------------------------------- */
	async delete( cid: string, key: string ) {
	    await this.restDelete( cid, key );
	}
}

