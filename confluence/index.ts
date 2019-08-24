import { ContentProperty } from './content-property';

AJS.$(document).ready( () => {
    let sample = AJS.$( '[key="sample"]' );
    sample.html( `<select id="s2">
            <option value="HI">${AJS.params.pageId}</option>
            <option value="HI">Hawaii</option>
            <option value="TX">Texas</option>
            <option value="CA">California</option>
        </select>` ); 
} )

