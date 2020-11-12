import * as React from "react";
import { Route, Switch } from "react-router-dom";

import AppliedRoute from "./components/AppliedRoute";

import Home from "./containers/Home";
import Login from "./containers/Login";
import NotFound from "./containers/NotFound";

import { AppProps } from "./interfaces";

export default function Routes({ appProps }: { appProps: AppProps }) {
    return (
        <Switch>
            <AppliedRoute path="/" exact component={Home} appProps={appProps} />
            <AppliedRoute path="/login" exact component={Login} appProps={appProps} />
            <Route component={NotFound} />
        </Switch>
    );
}