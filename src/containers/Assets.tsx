import * as React from "react";
import { Button, ButtonToolbar, FormControl, Table } from "react-bootstrap";

import * as ynab from "../api/ynab";

export default function Assets() {
    const [assets, setAssets] = React.useState<Array<ynab.Account>>([]);
    const [changes, setChanges] = React.useState<Array<number>>([]);

    React.useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        const accounts = await ynab.assetAccounts();
        setAssets(accounts);
        setChanges(accounts.map(() => 0));
    };

    const onChange = (target: HTMLTextAreaElement, index: number) => {
        const updatedBalances = changes.map((c, i) => i === index ? ynab.toNumber(target.value) - assets[index].balance : c);
        setChanges(updatedBalances);
    };

    const totalChange = () => changes.reduce((prev, c) => prev + c, 0);
    const totalAssets = () => assets.reduce((prev, a) => prev + a.balance, 0);
    const currentTotal = () => totalChange() + totalAssets();

    const constructTransaction = (a: ynab.Account, i: number): Omit<ynab.SaveTransaction, "date"> => {
        if (changes[i] !== 0) {
            const transaction: Omit<ynab.SaveTransaction, "date"> = {
                account_id: a.id,
                amount: changes[i],
                payee_name: "Market updates",
            };
            return transaction;
        }
        return null;
    };


    const handleSubmit = async () => {
        const transactions = assets.map(constructTransaction).filter((t) => t !== null);
        const budgets = await ynab.getBudgets();
        const investmentBudget = budgets.data.budgets.find((b) => b.name === 'Investment Accounts');
        await ynab.createTransactions(investmentBudget.id, {transactions});
        await ynab.syncWithRealAccounts();
        loadAssets();
    };


    return (
        <div className="Assets">
            <Table>
                <thead>
                    <tr key="Assets header">
                        <th>Asset Name</th>
                        <th style={{textAlign: "right"}}>Balance ${ynab.toString(currentTotal())}</th>
                        <th style={{textAlign: "right"}}>
                            {totalChange() !== 0 ?
                                <>
                                    ${ynab.toString(totalChange())} ({(totalChange()/totalAssets() * 100).toLocaleString(undefined, {maximumFractionDigits: 2})}%)
                                </>
                            : <>Change (%)</>}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {
                        assets.map(({ id, name, balance, note }, index) => {
                            const change = changes[index];
                            const updatedBalance = balance + change;
                            return <tr key={id}>
                                <td>
                                    <a href={note} target="_blank">{name}</a>
                                </td>
                                <td style={{textAlign: "right"}}>
                                    <form onSubmit={e => e.preventDefault()}>
                                        <FormControl style={{textAlign: "right"}}
                                            type="text"
                                            value={ynab.toString(updatedBalance)}
                                            placeholder="0.00"
                                            onChange={(ev) => onChange(ev.target as HTMLTextAreaElement, index)}
                                        />
                                    </form>
                                </td>
                                <td style={{textAlign: "right"}}>${ynab.toString(change)} ({(change/balance *100).toLocaleString(undefined, {maximumFractionDigits: 2})}%)</td>
                            </tr>
                        })
                    }
                </tbody>
            </Table>
            { totalChange() !== 0 ? 
                <ButtonToolbar>
                    <Button onClick={() => handleSubmit()}>Update</Button>
                </ButtonToolbar>
            : null}
        </div>
    );
}