import * as ReactDOM from "react-dom";

/* ----------------------------------------------------------------------------
* UIを作るのに必要な情報
* type: 形を決める(例えばdropdown)
* data: 可変要素(例えばドロップダウンのメニュー)
* ------------------------------------------------------------------------- */
export interface UISchema {
    type: string;
    data: any;
}

/* ----------------------------------------------------------------------------
* ターゲットの要素に、UIを付け加える処理の型
* ------------------------------------------------------------------------- */
export type UIRenderer = ( target: Element, schema: UISchema ) => JSX.Element;

/* ----------------------------------------------------------------------------
* コントロールを作るのに必要な情報
* ------------------------------------------------------------------------- */
export class UIBuilder {
    private renderer: { [type: string]: UIRenderer } = {};
    private schema: { [ selector: string ]: UISchema } = {};
    
    addRenderer( type: string, renderer: UIRenderer ) {
        this.renderer[ type ] = renderer;
    }
    
    addSchema( selector: string, schema: UISchema ) {
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
