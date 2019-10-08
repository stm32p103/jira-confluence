import { ValueEntity, ValueEntityMap } from './value-entity';

export interface Option {
  label: string;
  value: string;
}

export function createDropdownFunction( options: Option[] ): ( target: Element) => Element {
  const template = document.createElement( 'select' );

  // redundant
  options.forEach( option => {
    const node = document.createElement( 'option' );
    node.setAttribute( 'value', option.value );
    node.innerText = option.label;
    template.appendChild( node );
  } );
  
  console.log( template );  
  return ( elem: Element ) => {
    const select = template.cloneNode( true ) as Element;
    select.setAttribute( 'id', elem.getAttribute( 'id' ) );
    
    console.log( select );
    return select;
  };
}
