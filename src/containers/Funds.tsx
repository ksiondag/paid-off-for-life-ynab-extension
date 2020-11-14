import * as React from "react";

import { Table, ButtonToolbar, Button, FormControl } from "react-bootstrap";

import { RouterAppProps } from "../interfaces";

import AddFund from "./funds/AddFund";

import "./Funds.css";
import * as ynab from "../api/ynab";

interface Fund {
    id: number;
}

export default function Funds(props: React.PropsWithChildren<RouterAppProps>) {
    const [funds, setFunds] = React.useState([]);
    const [superfluousFunds, setSuperFluousFunds] = React.useState(0);

    React.useEffect(() => {
        loadFunds();
    }, []);

    const loadFunds = async () => {
        setFunds(await ynab.poflAccounts());
        const budgetAccounts = await ynab.budgetAccounts();

        // TODO: look at upcoming transactions and last month's direct bank transactions to come up with a buffer
        setSuperFluousFunds(budgetAccounts.reduce((prev, a) => prev + a.balance, 0) - 2500*1000 - 2000*1000)
    };

    return (
        <div className="Funds">
            <Table>
                <tr key="Superfluous funds">
                    <td>Superfluous funds</td>
                    <td style={{textAlign: "right"}}>${(superfluousFunds/1000).toLocaleString('en', {minimumFractionDigits: 2})}</td>
                </tr>
            </Table>
            <Table>
                <thead>
                    <tr>
                        <th>Fund Name</th>
                        <th style={{textAlign: "right"}}>Balance {funds.length > 0 ? `($${(funds.reduce((prev, {balance}) => prev + balance, 0)/1000).toLocaleString('en', {minimumFractionDigits: 2})})`: null}</th>
                    </tr>
                    {
                        funds.map(({ id, name, balance }) => {
                            return <tr key={id}>
                                <td>{name}</td>
                                <td style={{textAlign: "right"}}>${(balance/1000).toLocaleString('en', {minimumFractionDigits: 2})}</td>
                            </tr>
                        })
                    }
                </thead>
            </Table>
        </div>
    );
}