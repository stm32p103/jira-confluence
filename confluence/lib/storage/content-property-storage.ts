import { ContentPropertyAPI } from '../api/content-property';
import { KVStorage } from './kv-storage';

// デモ用。強制的に上書きしてしまう。例外処理も特に考えない。

export class ContentPropertyStorage implements KVStorage {
  constructor( private api: ContentPropertyAPI, private cid, private key: string ) {}
  
  async save( kv: { [key: string ]: any } ): Promise<void> {
    await this.api.set( this.cid, this.key, kv );
  }
  async load(): Promise<{ [key: string ]: any }> {
    const result = await this.api.get( this.cid, this.key );
    return result.value;
  }
}
