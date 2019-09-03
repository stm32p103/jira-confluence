import { Range } from './range';
import { RestAPI, Request, queryToString } from '@this/common';

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
function format( cid: string, result: any ): ContentProperty {
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

/* ------------------------------------------------------------------------
 * 例外
 * --------------------------------------------------------------------- */
export class BadRequestError {
  readonly name = '[Bad Request]';
  readonly message: string;
  constructor( err: Error ) {
    this.message = err.message;
  }
}

export class NotFoundError {
  readonly name = '[Not Found]';
  readonly message: string;
  constructor( err: Error ) {
    this.message = err.message;
  }
}

export class PermissionError implements Error {
  readonly name = '[Permission Error]';
  readonly message: string;
  constructor( err: Error ) {
    this.message = err.message;
  }
}

export class InvalidVersionError implements Error {
  readonly name = '[Invalid Version]';
  readonly message: string;
  constructor( err: Error ) {
    this.message = err.message;
  }
}

export class TooLongValueError implements Error {
  readonly name = '[Invalid Version]';
  readonly message: string;
  constructor( err: Error ) {
    this.message = err.message;
  }
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
      switch( err.status ) {
      case 404: throw new NotFoundError( err );
      default: throw new Error( err );
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
      switch( err.status ) {
      case 404: throw new NotFoundError( err );
      default: throw new Error( err );
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
	  } catch( err ) {
      switch( err.status ) {
      case 400: throw new BadRequestError( err );
      case 403: throw new PermissionError( err );
      case 409: throw new InvalidVersionError( err );
      case 413: throw new TooLongValueError( err );
      default: throw new Error( err );
      }
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
	  } catch ( err ) {
      switch( err.status ) {
      case 400: throw new BadRequestError( err );
      case 403: throw new PermissionError( err );
      case 404: throw new NotFoundError( err );
      case 409: throw new InvalidVersionError( err );
      case 413: throw new TooLongValueError( err );
      default: throw new Error( err );
      }
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
      await this.api.request( req );
    } catch( err ) {
      switch( err.status ) {
      case 404: throw new BadRequestError( err );
      default: throw new Error( err );
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
      switch( err.status ) {
      case 400: throw new BadRequestError( err );
      default: throw new Error( err );
    }
  }
	}
	/* ------------------------------------------------------------------------
	 * 全てのプロパティを取得する
	 * --------------------------------------------------------------------- */
	async getAll( cid: string, range: Range = new Range() ): Promise<ContentPropertyList> {
	  let response;
	  try {
	    response = await this.restFindAll( cid, { start: range.start, limit: range.limit } );
    } catch( err ) {
      // 404: return undefined
      if( !( err instanceof NotFoundError ) ) {
        throw err;
      }
    };
    
    const results = response.results.map( result => format( cid, result ) );
    const resultRange = rangeFromResponse( response );
    return {
      results: results,
      range: rangeFromResponse( resultRange )
	  } 
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
		let result;
		
		try {
		  result = await this.restFindByKey( cid, key );
		} catch( err ) {
		  if( !( err instanceof NotFoundError ) ) {
		    throw err;
		  }
		}

		if( result ) {
	    return format( cid, result );		  
		}
	}

  /* ------------------------------------------------------------------------
   * 1. 存在の有無にかかわらず、新規作成を試みる。
   *      400 errorの場合、既に存在する可能性があるので、2以降を試す。
   * 2. 既に存在していたら、指定されたバージョンで更新する。この際、バージョンが妥当でなければ例外を投げる。
   * 3. 既に存在していて、バージョンの指定が無ければ、最新バージョンを取得してから更新する。
   *    他のユーザが既に更新していた場合、その内容は失われる。
   *    最新バージョンが取得できない場合、他のユーザが消したかもしれないので、再度新規作成を試みる。
   * --------------------------------------------------------------------- */
	async set( cid: string, key: string, value: any, option?: { version: number } ): Promise<ContentProperty> {	  
    let response;

    // try create
    try {
	    response = await this.restCreate( cid, key, value );
	  } catch( err ) {
	    if( err instanceof InvalidVersionError ) {
	      console.info( `cid: ${cid}, key: ${key} seems to exist.` );
	    } else {
	      throw err;
	    }
	  }
	  
	  if( response ) {
	    return format( cid, response );	    
	  }
	  
	  // version
	  let version: number;
    if( option ) {                            
      version = option.version;
	  } else {
	   /* --------------------------------------------------------------------
	    * 既にContent Propertyがあると判定した直後に他のユーザが削除した場合、
	    * ここでバージョンが取得でき図に例外が発生する。
	    * ----------------------------------------------------------------- */
	    const latest = await this.restFindByKey( cid, key, { expand: 'version' } );
      version = 1 + latest.version.number;	  
    }

    let updateRes = await this.restUpdate( cid, key, value, version );
    return format( cid, updateRes );
	}

	/* ------------------------------------------------------------------------
	 * keyを削除する。
	 * 一括削除はAPIが無いため、負荷を抑えるために1つずつ削除する。
	 * --------------------------------------------------------------------- */
	async delete( cid: string, key: string ) {
	  try {
	    await this.restDelete( cid, key );
	  } catch( err ) {
	    if( !( err instanceof NotFoundError ) ) {
	      throw err;
	    }
	  }
	}
}

