import { KVStorage } from './kv-storage'; 
/* ----------------------------------------------------------------------------
 * 値を保存する要素のインターフェース
 * ------------------------------------------------------------------------- */
export interface Serializable {
  setValue( data: any );
  getValue(): any;
}

/* ----------------------------------------------------------------------------
 * serializableから値を取得してstorageに保存する
 * またはその逆を行う
 * ------------------------------------------------------------------------- */
export class Serializer {
  private serializables: { [ key: string ]: Serializable } = {};
  constructor( private storage: KVStorage ) {}
  
  register( key: string, serializable: Serializable ) {
    this.serializables[ key ] = serializable;
  }

  unregister( key: string ) {
    delete this.serializables[ key ];
  }
  
  async serialize() {
    let kv: { [key: string ]: any } = {};
    
    Object.keys( this.serializables )
    .forEach( key => kv[ key ] = this.serializables[key].getValue() );
    
    await this.storage.save( kv );
  }
  
  async deserialize() {
    const kv = await this.storage.load();
    
    Object.keys( kv )
    .forEach( key => {
      const value = kv[ key ];
      const serializer = this.serializables[ key ];
      if( serializer ) {
        serializer.setValue( value );
      }
    } );
  }
}
