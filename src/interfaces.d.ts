import { RouteProps } from "react-router-dom";
import { RouterProps } from "react-router";

export interface AppProps {
    isAuthenticated: boolean;
    userHasAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface RouterAppProps extends RouterProps, AppProps {
}

export interface AppliedRouteObj extends RouteProps {
    component: React.ComponentType<AppProps>;
    appProps: AppProps;
}