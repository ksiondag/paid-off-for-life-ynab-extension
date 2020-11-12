import * as React from "react";
import "./Home.css";

import { RouterAppProps } from "../interfaces";
import Funds from "./Funds";

export default function Home(props: React.PropsWithChildren<RouterAppProps>) {
    return (
        <div className="Home">
            <div className="lander">
                <h1>Paid Off for Life</h1>
                <p>Pay off your life one budget at a time.</p>
            </div>
            {props.isAuthenticated &&
                <Funds {...props} />
            }
        </div>
    );
}