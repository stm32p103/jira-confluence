import * as React from "react";

export interface Item {
    label: string;
    value: string;
}

interface Props {
    id: string;
    items: Item[];
}

interface State {
    selected: string;
}

/* ----------------------------------------------------------------------------
 * DropdownItemの情報をもとに、ドロップダウンを作る
 * ------------------------------------------------------------------------- */
export class Dropdown extends React.Component<Props,State> {
    state: State;
    constructor( public props: Props ) {
        super( props );
        this.state = {
            selected: props.items[0].value
        };
   }
   componentDidMount() {}
   componentWillUnmount() {}

   private options() {
       // key should be assigned.
       return this.props.items.map( ( item, index ) => <option value={item.value} key={index}>{item.label}</option> );
   }
   
   render() {
       return <form className="aui">
           <select className="select" id={ this.props.id }
                   onChange={ (e)=> { this.setState( { selected: e.target.value } ) } }>
                   { this.options() }
           </select>
       </form>
    }
}
