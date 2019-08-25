import * as React from 'react';

export interface Props {
}
export interface State {
    date:Date;
}

export class Clock extends React.Component<Props,State> {
    state: State;
    timerId: number;
    constructor( prop: Props ) {
        super( prop );
        this.state = {date: new Date()};
    }
    
    componentDidMount() {
        this.timerId = setInterval( () => this.tick(), 1000 );
    }

    componentWillUnmount() {
        clearInterval(this.timerId);
    }

    tick() {
        this.setState( {
            date: new Date()
        });
    }

    render() {
        return (
                <div>
                <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
                </div>
        );
    }
}
