import * as React from "react";
import { AJSRestAPI } from '@this/common';
import { ContentPropertyAPI, Serializer } from '@this/lib';
import { Dropdown, UIBuilder, Item } from '@this/components';
import ReactDOM from 'react-dom';

const dropdownItems: { [ selection: string ]: Item[] } = {
    'SelA': [ 
      { value: '1', label: 'A-1' },
      { value: '2', label: 'A-2' },
      { value: '3', label: 'A-3' }
    ], 
    'SelB': [ 
      { value: '1', label: 'B-1' },
      { value: '2', label: 'B-2' }
    ]
}

interface WithLoadingProps {
  loading: boolean;
}

const LoadingSpinner = () => <h1>Loading</h1>
const withLoading = <P extends object>(Component: React.ComponentType<P>) =>
  class WithLoading extends React.Component<P & WithLoadingProps> {
    render() {
      const { loading, ...props } = this.props;
      return loading ? <LoadingSpinner /> : <Component {...props as P} />;
    }
};

const DropdownLoading = withLoading( Dropdown );


  
export async function testBuildDropdown( target: HTMLElement, baseUrl: string, pageId: string, key: string ) {
  const api = new ContentPropertyAPI( new AJSRestAPI( baseUrl ) );
  const app = new App( api );
  const builder = new UIBuilder();
  
  // add renderer
  builder.addRenderer( 'dropdown', ( elem, sch ) => {
    const id = elem.getAttribute('id');
    const items = sch.data as Item[];
    
    // initialize
    return <DropdownLoading items={sch.data} loading={true}
                     value={app.get(id)}
                     onChange={ value => app.set(id, value)}></DropdownLoading>
  } );

  // add schema
  Object.keys( dropdownItems ).forEach( key => {
    builder.addSchema( `dropdown[selection="${key}"]`, { type: 'dropdown', data: dropdownItems[key] } );    
  } );
  
  // render
  builder.render();

  // simple but affordable
  ReactDOM.render( 
  <div className="aui-buttons">
    <button className="aui-button" onClick={ async ()=> await app.load( pageId, key ) }>GET</button>
    <button className="aui-button" onClick={ async ()=> await app.save( pageId, key ) }>SET</button>
  </div>, target );
}

class App {
  private kv: { [key:string]: string } = {};
  constructor( private api: ContentPropertyAPI ) {}
  
  get( key: string ) { return this.kv[key] }
  set( key: string, value: string ) { this.kv[key] = value }
  async save( cid: string, key: string ) {
    console.log( this.kv );
    await this.api.set( cid, key, this.kv );
  }
  async load( cid: string, key: string ) {
    const res = await this.api.get( cid, key );
    console.log( res.value );
    this.kv = { ...this.kv, ...res.value };
  }
}


