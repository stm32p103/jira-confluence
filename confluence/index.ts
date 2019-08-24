import { ContentPropertyAccessor } from './content-property';

AJS.$(document).ready( async () => {
    let sample = AJS.$( '[key="sample"]' );
    console.log( AJS.params );
    sample.html( `<select id="s2">
            <option value="HI">${AJS.params.pageId}</option>
            <option value="HI">Hawaii</option>
            <option value="TX">Texas</option>
            <option value="CA">California</option>
        </select>` ); 
    
    let property = new ContentPropertyAccessor( AJS.params.baseUrl );
    const cid = AJS.params.pageId;
    const key = 'sample';

    console.log( '---------------------------' );
    let p = await property.get( cid, key );
    console.log( p );

    console.log( '---------------------------' );
    let pAll = await property.getAll( cid );
    console.log( pAll );

    console.log( '---------------------------' );
    p = await property.set( cid, key, { sample: 'created' } );
    console.log( p );

    console.log( '---------------------------' );
    p = await property.set( cid, key, { sample: 'updated' } );
    console.log( p );

    console.log( '---------------------------' );
    await property.delete( cid, key );
    p = await property.get( cid, key );
    console.log( p );
    
} )

