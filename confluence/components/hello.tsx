import * as React from "react";

export interface HelloProps { macroId: string }

export const Hello = (props: HelloProps) => <p>id:{props.macroId}</p>;