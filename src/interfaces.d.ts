import { RouteProps } from "react-router-dom";

export interface AppliedRouteObj<AppProps> extends RouteProps {
    component: React.ComponentType<AppProps>;
    appProps: AppProps;
}