export type RestFindAllParam = {
    expand?: string;
    start?: number;
    limit?: number;
}

export type RestFindByKeyParam = {
    expand?: string;
}

type ContentPropertyReferer = {
    cid: string;
    key?: string;
    param?: { [ key: string ]: any };
}

export class ContentProperty {
	/* ------------------------------------------------------------------------
	 * URLを作る。
	 * --------------------------------------------------------------------- */
	private toUrl( ref: ContentPropertyReferer ) {
	    let res = [ this.base, 'content', ref.cid, 'property' ].join( '/' );
	    
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
     * URLを作る。
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
	        option.value = data;
	        option.headers = { 'Content-Type': 'application/json' };
	    }
	    
	    await AJS.$.ajax( option );
	    return response;
	}
	
	constructor( private base: string ) {}
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
        let response = await this.request( 'post', { cid: cid, key: key }, { 'value': value } );
        console.log( response );
        return response;
    }
	/* ------------------------------------------------------------------------
	 * key を value で更新する。バージョンは数字で指定する。(過去と同じ値だとエラー)
	 * --------------------------------------------------------------------- */
	async restUpdate( cid: string, key: string, value: any, version: number ) {
        let response = await this.request( 'post', { cid: cid, key: key }, { 'value': value, 'version': { 'number': version } } );
        console.log( response );
	    return response;
	}
	/* ------------------------------------------------------------------------
	 * 全てのプロパティを取得する
	 * --------------------------------------------------------------------- */
	async getAll( cid: string, param?: RestFindAllParam ) {
		let res = await this.restFindAll( cid, param );
		let property = {};

		res.results.map( kv => {
			property[ kv.key ] = kv.value;
		} )
		return property;
	} 

	/* ------------------------------------------------------------------------
	 * key の値を取得する。
	 * --------------------------------------------------------------------- */
	async get( cid: string, key: string, param?: RestFindByKeyParam ) {
		let res = await this.restFindByKey(cid, key, param );
		return res.value;
	}
	
	/* ------------------------------------------------------------------------
	 * key が存在していなかったら新規作成、存在していたらバージョンを1つ挙げて更新する。
	 * リクエストが1回余計に必要なのは、例えば投機的にUpdateしてNGならCreateするよう改善する。
	 * Updateをするために、newVersionを使うため予約するが、今は使わない
	 * --------------------------------------------------------------------- */
	async set( cid, key, value, newVersion ) {
		const latest = await this.restFindByKey( cid, key, { 'expand': 'version' } );
		
		let response;
		if( latest !== null ) {
			const version = 1 + latest.version.number;
			response = this.restUpdate( cid, key, value, version );
		} else {
			response = this.restCreate( cid, key, value );
		}
		return response;
	}
}

