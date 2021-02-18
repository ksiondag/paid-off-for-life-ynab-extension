import * as React from "react";

import { Button, ButtonToolbar, Table } from "react-bootstrap";

import "./Funds.css";
import * as ynab from "../api/ynab";

export default function Funds() {
    const [funds, setFunds] = React.useState<Array<ynab.Account>>([]);
    const [superfluousFunds, setSuperFluousFunds] = React.useState(0);

    React.useEffect(() => {
        loadFunds();
    }, []);

    const loadFunds = async () => {
        setFunds(await ynab.poflAccounts());
        const budgetAccounts = await ynab.budgetAccounts();

        // TODO: look at upcoming transactions and last month's direct bank transactions to come up with a buffer
        // Come up with rules for the different accounts
        setSuperFluousFunds(budgetAccounts.reduce((prev, a) => prev + a.balance, 0) - 2500 * 1000 - 2000 * 1000);
    };

    const withdrawalAmount = (balance: number, note: string) => {
        const rules = (note ? note.split(`\n`) : []).filter(rule => rule.startsWith(`POFL: `));

        let setAmount;
        let inflate = false;
        let deflate = false;
        for (const index in rules) {
            const rule = rules[index];

            if (rule.search("Inflate") !== -1) {
                inflate = true;
            }

            if (rule.search("Deflate") !== -1) {
                deflate = true;
            }

            setAmount = setAmount ? setAmount : rule.match(/[0-9]+/);
        }

        if (setAmount) {
            let newBalance = Number(setAmount) * 300000;
            if (inflate) {
                newBalance = Math.max(newBalance, balance);
            } else if (deflate) {
                newBalance = Math.min(newBalance, balance);
            }
            balance = newBalance;
        }
        return (Math.floor(balance / 3000) / 100).toLocaleString('en', { minimumFractionDigits: 2 });
    };

    return (
        <div className="Funds">
            <ButtonToolbar>
                <Button onClick={() => ynab.syncWithRealAccounts()}>Sync with Assets</Button>
            </ButtonToolbar>

            <Table>
                <tbody>
                    <tr key="Superfluous funds">
                        <td>Superfluous funds</td>
                        <td style={{ textAlign: "right" }}>${(superfluousFunds / 1000).toLocaleString('en', { minimumFractionDigits: 2 })}</td>
                    </tr>
                </tbody>
            </Table>
            <Table>
                <thead>
                    <tr key="Funds header">
                        <th>Fund Name</th>
                        <th>Monthly Withdrawal</th>
                        <th style={{ textAlign: "right" }}>Balance {funds.length > 0 ? `($${(funds.reduce((prev, { balance }) => prev + balance, 0) / 1000).toLocaleString('en', { minimumFractionDigits: 2 })})` : null}</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        funds.map(({ id, name, balance, note }) => {
                            return <tr key={id}>
                                <td>{name}</td>
                                <td>{withdrawalAmount(balance, note)}</td>
                                <td style={{ textAlign: "right" }}>${(balance / 1000).toLocaleString('en', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        })
                    }
                </tbody>
            </Table>
        </div>
    );
}