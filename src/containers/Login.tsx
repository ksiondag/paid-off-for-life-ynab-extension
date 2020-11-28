import * as React from "react";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Login.css";
import * as ynab from "../api/ynab";
import { AppRouterProps } from "../interfaces";

export default function Login(props: React.PropsWithChildren<AppRouterProps>) {
    const [token, setToken] = React.useState("");

    function validateForm() {
        return token.length > 0;
    }

    const login = async ({token}: { token: string }) => {
        const result = await ynab.login({token});
        if (result.success) {
            props.userHasAuthenticated(true);
            props.history.push("/");
        } else {
            alert(result.message);
        }
    };

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        login({ token });
    }

    return (
        <div className="Login">
            <form onSubmit={handleSubmit}>
                <FormGroup controlId="token" bsSize="large">
                    <ControlLabel>Personal YNAB Token</ControlLabel>
                    <FormControl
                        value={token}
                        onChange={e => setToken((e.target as HTMLTextAreaElement).value)}
                        type="password"
                    />
                </FormGroup>
                <Button block bsSize="large" disabled={!validateForm()} type="submit">
                    Login
                </Button>
            </form>
        </div>
    );
}