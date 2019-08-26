import { ContentPropertyAccessor } from './lib';

AJS.$(document).ready( async () => {
    const property = new ContentPropertyAccessor( AJS.params.baseUrl );
    let test = await property.getByCql( 'space=TEST', 'dropdowns' );
    console.log( test );
} )
