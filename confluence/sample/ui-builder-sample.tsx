import { ContentPropertyAPI, AJSRestAPI } from '../lib';

export async function testContentProperty( baseUrl: string, cid: string, key: string ) {
    const api = new ContentPropertyAPI( new AJSRestAPI( baseUrl ) );
    
    AJS.$(document).ready( async () => {
        const builder = new ControlBuilder();
        builder.addRenderer( 'dropdown', ( elem, sch ) => {
            const id = elem.getAttribute('id');
            const item = sch.data as Item[];
            console.log( sch );
            return <Dropdown items={item} id={id}/>
        } );

        builder.addSchema( '[key="dr1"]', { type: 'dropdown', data: [ { value: '1', label: '1', items:[] }, { value: '2', label: '2', items:[] }, { value: '3', label: '3', items:[] } ] } );
        builder.addSchema( '[key="dr2"]', { type: 'dropdown', data: [ { value: 'b', label: 'x', items:[] } ] } );
        builder.addSchema( '[key="dr3"]', { type: 'dropdown', data: [ { value: 'b', label: 'x', items:[] } ] } );
        
        builder.render();
    } );
}




