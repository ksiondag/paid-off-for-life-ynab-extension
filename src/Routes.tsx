import * as React from "react";
import { Route, Switch } from "react-router-dom";

import AppliedRoute from "./components/AppliedRoute";

import Funds from "./containers/Funds";
import Home from "./containers/Home";
import Login from "./containers/Login";
import Playback from "./containers/Playback";
import Migrate from "./containers/Migrate";
import NotFound from "./containers/NotFound";
import Assets from "./containers/Assets";
import { AppProps } from "./interfaces";

export default function Routes({ appProps }: { appProps: AppProps }) {
    return (
        <Switch>
            <AppliedRoute path="/" exact component={Home} appProps={appProps} />
            <AppliedRoute path="/login" exact component={Login} appProps={appProps} />
            <AppliedRoute path="/funds" exact component={Funds} appProps={appProps} />
            <AppliedRoute path="/assets" exact component={Assets} appProps={appProps} />
            <AppliedRoute path="/migrate" exact component={Migrate} appProps={appProps} />
            <AppliedRoute path="/playback" exact component={Playback} appProps={appProps} />
            <Route component={NotFound} />
        </Switch>
    );
}