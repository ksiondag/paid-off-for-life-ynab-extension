import * as React from "react";
import { Link, withRouter, Router, RouteComponentProps } from "react-router-dom";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "./App.css";
import Routes from "./Routes";
import * as token from "./api/ynab";

function App(props: React.PropsWithChildren<RouteComponentProps>) {
    const [isAuthenticated, userHasAuthenticated] = React.useState(false);

    React.useEffect(() => {
        onLoad();
    }, []);

    async function onLoad() {
        userHasAuthenticated(token.verify());
    }

    function handleLogout() {
        userHasAuthenticated(false);
        props.history.push(`/login`);
    }

    return <div className="App container">
        <Navbar fluid collapseOnSelect>
            <Navbar.Header>
                <Navbar.Brand>
                    <Link to="/">Paid Off for Life</Link>
                </Navbar.Brand>
                <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
                {isAuthenticated ?
                    <Nav>
                        <LinkContainer to="/funds">
                            <NavItem>Funds</NavItem>
                        </LinkContainer>
                        <LinkContainer to="/assets">
                            <NavItem>Assets</NavItem>
                        </LinkContainer>
                        <LinkContainer to="/fidebt">
                            <NavItem>FI Debt</NavItem>
                        </LinkContainer>
                        <LinkContainer to="/migrate">
                            <NavItem>Migrate</NavItem>
                        </LinkContainer>
                    </Nav>
                    : null}
                <Nav pullRight>
                    {isAuthenticated
                        ?
                        <NavItem onClick={handleLogout}>Logout</NavItem>
                        :
                        <LinkContainer to="/login">
                            <NavItem>Login</NavItem>
                        </LinkContainer>
                    }
                </Nav>
            </Navbar.Collapse>
        </Navbar>
        <Routes appProps={{ isAuthenticated, userHasAuthenticated }} />
    </div>;
}

export default withRouter(App);
