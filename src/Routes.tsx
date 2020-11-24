import * as React from "react";
import { Route, Switch } from "react-router-dom";

import AppliedRoute from "./components/AppliedRoute";

import Funds from "./containers/Funds";
import Home from "./containers/Home";
import Login from "./containers/Login";
import Playback from "./containers/Playback";
import NotFound from "./containers/NotFound";
import Assets from "./containers/Assets";

export default function Routes<T>({ appProps }: { appProps: T }) {
    return (
        <Switch>
            <AppliedRoute path="/" exact component={Home} appProps={appProps} />
            <AppliedRoute path="/login" exact component={Login} appProps={appProps} />
            <AppliedRoute path="/funds" exact component={Funds} appProps={appProps} />
            <AppliedRoute path="/assets" exact component={Assets} appProps={appProps} />
            <AppliedRoute path="/playback" exact component={Playback} appProps={appProps} />
            <Route component={NotFound} />
        </Switch>
    );
}