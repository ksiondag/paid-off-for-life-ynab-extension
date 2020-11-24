import * as React from "react";
import "./Home.css";

import { AppProps } from "../interfaces";

export default function Home(props: React.PropsWithChildren<AppProps>) {
    return (
        <div className="Home">
            <div className="lander">
                <h1>Paid Off for Life</h1>
                <p>Pay off your life one budget at a time.</p>
            </div>
        </div>
    );
}