interface Schema {
    type: string;
    data: any;
}

type Renderer = ( elem: Element, schema: Schema ) => JSX.Element;

class UIBuilder {
    private renderer: { [type: string]: Renderer } = {};
    private schema: { [ selector: string ]: Schema } = {};
    
    addRenderer( type: string, renderer: Renderer ) {
        this.renderer[ type ] = renderer;
    }
    
    addSchema( selector: string, schema: Schema ) {
        this.schema[ selector ] = schema;
    }
    
    render() {
        for( let selector in this.schema ) {
            const targets = document.querySelectorAll( selector );
            for( let i=0; i<targets.length; i++ ) {
                const target = targets.item(i);
                const schema = this.schema[ selector ];
                const render = this.renderer[schema.type ];
                ReactDOM.render( render( target, schema ), target ); 
            }
        }
    }
}