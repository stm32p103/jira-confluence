export interface ValueEntity {
  readonly id: string;
  get(): any;
  set( value: any );
}

export class ValueEntityMap {
  private map: { [ id:string ]: ValueEntity } = {};
  constructor() {}
  
  add( v: ValueEntity ) {
    this.map[ v.id ] = v;
  }
  
  set( map: { [ id: string ]: any } ){
    for( let id in map ) {
      const value = this.map[ id ];
      
      if( value ) {
        value.set( map[ id ] );
      }
    }
  }
  
  get(): { [ id: string ]: any } {
    let res: { [ id: string ]: any } = {};
    
    for( let id in this.map ) {
      res[ id ] = this.map[ id ];
    }
    return res;
  }
}

