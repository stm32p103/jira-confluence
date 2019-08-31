import { Range } from './range';
import { RestAPI, Request, queryToString } from '../request';

/* ------------------------------------------------------------------------
 * Content Property
 * --------------------------------------------------------------------- */
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

/* ------------------------------------------------------------------------
 * Content Property List
 * 複数取得する際の型
 * --------------------------------------------------------------------- */
export interface ContentPropertyList {
  results: ContentProperty[];
  range: Range;
}

/* ------------------------------------------------------------------------
 * Functions
 * --------------------------------------------------------------------- */
function apiUrl( cid: string, key?: string ) {
  let url = [ '/rest/api/content', cid, 'property' ].join( '/' );
  if( key ) {
    url = url + '/' + key;
  }
  return url;
}

/* ------------------------------------------------------------------------
 * 受け取ったデータを整形する
 * --------------------------------------------------------------------- */
function format( cid: string, result?: any ): ContentProperty {
  if( result ) {
    return {
      cid: cid,
      id: result.id,
      key: result.key,
      value: result.value,
      version: {
        when: result.version.when,
        number: result.version.number
      }
    };
  } else {
    return undefined;
  }
}

/* ------------------------------------------------------------------------
 * 複数データを返す応答からRangeを取得する
 * --------------------------------------------------------------------- */
function rangeFromResponse( res: any ): Range {
  return new Range( {
    start: res.start,
    limit: res.limit,
    size: res.size
  } );
}

export class ContentPropertyAPI {
  constructor( private readonly api: RestAPI ) {}
    
  /* ------------------------------------------------------------------------
   * 全てのプロパティを取得する(REST API)
	 * https://docs.atlassian.com/ConfluenceServer/rest/6.15.7/#api/content/{id}/property-findAll
	 * --------------------------------------------------------------------- */
	private async restFindAll( cid: string, param: any = {} ) {
		const req = Request.get( apiUrl( cid ) + queryToString( param ) );
		try {
		  return await this.api.request( req );
		} catch( err ) {
			if( err.status === 404 ) {
			  return undefined;
			} else {
			  throw new Error( err );
			}
		}
	}

	/* ------------------------------------------------------------------------
	 * key の値を取得する。(REST API)
	 * https://docs.atlassian.com/ConfluenceServer/rest/6.15.7/#api/content/{id}/property-findByKey
	 * --------------------------------------------------------------------- */
	private async restFindByKey( cid: string, key: string, param: any = {} ) {
	  const req = Request.get( apiUrl( cid, key ) + queryToString( param ) );
	  try { 
	    return await this.api.request( req );
	  } catch( err ) {
	    if( err.status === 404 ) {
	      return undefined;
	    } else {
	      throw new Error( err );
	    }
	  }
	}
	
	/* ------------------------------------------------------------------------
	 * key を value で新規作成する。
	 * https://docs.atlassian.com/ConfluenceServer/rest/6.15.7/#api/content/{id}/property-create
	 * --------------------------------------------------------------------- */
	private async restCreate( cid: string, key: string, value: any ) {
	  const req = Request.post( apiUrl( cid ) );
	  req.attatchData( { key: key, value: value } );
	  try {
	    return await this.api.request( req );            
	  } catch ( err ) {
	    // TODO: handle 400, 403, 413, 415 error
	    throw new Error( err );
	  }
	}
	/* ------------------------------------------------------------------------
	 * key を value で更新する。バージョンは数字で指定する。(過去と同じ値だとエラー)
	 * https://docs.atlassian.com/ConfluenceServer/rest/6.15.7/#api/content/{id}/property-update
	 * --------------------------------------------------------------------- */
	private async restUpdate( cid: string, key: string, value: any, version: number ) {
	  const req = Request.put( apiUrl( cid, key ) );
	  req.attatchData( { key: key, value: value, version: { number: version } } );
	  
	  try {
	    return await this.api.request( req );
	  } catch( err ) {
	    throw new Error( err );
	  }
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
	    if( err.status == 404 ) {
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
	  const url = '/rest/api/content/search';
	  const req = Request.get( url + queryToString( param ) );
	  try {
	    return await this.api.request( req );
	  } catch( err ) {
	    // invalid cql -> null. other -> err.            
	    if( err.status !== 400 ) {
	      throw new Error( err );
	    }
	  }
	}
	/* ------------------------------------------------------------------------
	 * 全てのプロパティを取得する
	 * --------------------------------------------------------------------- */
	async getAll( cid: string, range: Range = new Range() ): Promise<ContentPropertyList> {
	  let response = await this.restFindAll( cid, { start: range.start, limit: range.limit } );
	  let list = response.results.map( result => format( cid, result ) );
	  
	  if( list == undefined ) {
	    list = [];
	  }
	  
	  return {
	    results: list,
	    range: rangeFromResponse( response )
	  };
	} 

  /** ---------------------------------------------------------------------
   * @param cql CQL文字列。例えば 'SPACE=TEST'。
   * @param key Content PropertyのKey
   * @param range start:開始位置とlimit:最大データ数を指定する。sizeは無視する。
   * @returns
   * CQLにマッチするContent Propertyを取得する。
   * Rangeは、start:開始数、size:取得データ数、limit:CQLにマッチしたContent数。
   * limitにはContent Propertyが無いものも含まれる。
   * --------------------------------------------------------------------- */
	async getByCql( cql: string, key: string, range: Range = new Range() ): Promise<ContentPropertyList> {
	  let response = await this.restSearch( {
	    cql: cql,
	    expand: 'version,metadata.properties.' + key,
	    start: range.start,
	    limit: range.limit
	  } );
	  
	  let list: ContentProperty[] = response.results
	  .filter( result => result.metadata.properties[ key ] != undefined )
	  .map( result => format( result.id, result.metadata.properties[ key ] ) );
	  
	  return {
	    results: list,
	    range: rangeFromResponse( response )
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

