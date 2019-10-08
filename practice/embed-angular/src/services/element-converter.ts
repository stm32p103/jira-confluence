type ElementConverter = ( target: Element ) => Element;
type ElementConverterMap = { [ selector:string ]: ElementConverter };

export function convertElement( map: ElementConverterMap ) {
  for( let selector in map ) {
    const targets = document.querySelectorAll( selector );
    const convert = map[ selector ];
        
    for( let i=0; i<targets.length; i++ ) {
      const target = targets.item(i);
      const element = convert( target )

      if( element ) {
        target.appendChild( element );        
      }
    }
  }
}
