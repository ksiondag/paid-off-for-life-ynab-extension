import * as React from "react";
import { Route } from "react-router-dom";

import { AppliedRouteObj } from "../interfaces";

export default function AppliedRoute<T>({ component: C, appProps, ...rest }: AppliedRouteObj<T>) {
    return (
        <Route {...rest} render={props => <C {...props} {...appProps} />} />
    );
}