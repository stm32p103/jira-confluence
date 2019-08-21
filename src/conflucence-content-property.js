function toQuery( param ) {
	let paramArray = [];
	for( let key in param ) {
		paramArray.push( key + '=' + param[key] );
	}
	
	let query = '';
	if( paramArray.length > 0 ) {
		query = '?' + paramArray.join( '&' );
	}
	
	return query;
}

export class ContentProperty {
	/* ------------------------------------------------------------------------
	 * URLを作る。
	 * --------------------------------------------------------------------- */
	contentUrl() { return [ this.base, 'content', this.cid, 'property' ].join('/') } 
	propertyUrl( key ) { return [ this.contentUrl(), key ].join('/') } 
	
	constructor( base, cid ) {
		this.base = base;
		this.cid = cid;
	}

	/* ------------------------------------------------------------------------
	 * 全てのプロパティを取得する(REST API)
	 * --------------------------------------------------------------------- */
	async _getAll( param ) {
		let response;
		
		try {
			await AJS.$.ajax( {
				url: this.contentUrl() + toQuery( param ),
				type: 'get',
			    success: ( res ) => {
			    	response = res;
		    } } );						
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
	 * 全てのプロパティを取得する
	 * --------------------------------------------------------------------- */
	async getAll( param ) {
		let res = await this._getAll( param );
		let property = {};

		res.results.map( kv => {
			property[ kv.key ] = kv.value;
		} )
		return property;
	} 

	/* ------------------------------------------------------------------------
	 * key の値を取得する。(REST API)
	 * --------------------------------------------------------------------- */
	async _get( key ) {
		let response;
		try {
			await AJS.$.ajax( {
				url: this.propertyUrl( key ),
				type: 'get',
			    success: ( res ) => {
			    	response = res;
		    } } );						
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
	 * key の値を取得する。
	 * --------------------------------------------------------------------- */
	async get( key ) {
		let res = await this._get( key );
		return res.value;
	}
	
	/* ------------------------------------------------------------------------
	 * key を value で新規作成する。
	 * --------------------------------------------------------------------- */
	async _create( key, value ) {
		let response;
		
		await AJS.$.ajax( {
			url: this.contentUrl( key ),
			type: 'post',
			headers	: {
				'Content-Type': 'application/json'
			},
			data: JSON.stringify( { 'key': key, 'value': value } ),
		    success: ( res ) => {
		    	response = res;
	    } } );
		
		return response;
	}
	
	/* ------------------------------------------------------------------------
	 * key を value で更新する。バージョンは数字で指定する。(過去と同じ値だとエラー)
	 * --------------------------------------------------------------------- */
	async _update( key, value, version ) {
		let response;
		
		await AJS.$.ajax( {
			url: this.propertyUrl( key ),
			type: 'put',
			headers	: {
				'Content-Type': 'application/json'
			},
			data: JSON.stringify( { 'key': key, 'value': value, 'version': { 'number': version } } ),
		    success: ( res ) => {
		    	response = res;
	    } } );
		
		return response;
	}
	
	/* ------------------------------------------------------------------------
	 * key が存在していなかったら新規作成、存在していたらバージョンを1つ挙げて更新する。
	 * リクエストが1回余計に必要なのは、例えば投機的にUpdateしてNGならCreateするよう改善する。
	 * Updateをするために、newVersionを使うため予約するが、今は使わない
	 * --------------------------------------------------------------------- */
	async set( key, value, newVersion ) {
		const latest = await this._get( key );
		let response;
		if( latest !== null ) {
			const version = 1 + latest.version.number;
			response = this._update( key, value, version );
		} else {
			response = this._create( key, value );
		}
		return response;
	}
}

