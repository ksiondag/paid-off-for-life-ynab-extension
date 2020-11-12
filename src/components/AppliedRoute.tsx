import * as React from "react";
import { Route } from "react-router-dom";

import { AppliedRouteObj } from "../interfaces";

export default function AppliedRoute({ component: C, appProps, ...rest }: AppliedRouteObj) {
    return (
        <Route {...rest} render={props => <C {...props} {...appProps} />} />
    );
}