import * as React from "react";

import { AppProps } from "../interfaces";

import * as ynab from "../api/ynab";
import { Button, Checkbox, Dropdown, FormControl, Table } from "react-bootstrap";

export default function Migrate(props: React.PropsWithChildren<AppProps>) {
    const [target, setTarget] = React.useState<ynab.BudgetSummary>(null);
    const [budgets, setBudgets] = React.useState<Array<ynab.BudgetSummary>>([]);
    const [accounts, setAccounts] = React.useState<{[budget_id: string]: Array<ynab.Account>}>({});
    const [renames, setRenames] = React.useState<{[id: string]: string}>({});

    React.useEffect(() => {
        loadBudgets();
    }, []);

    const loadBudgets = async () => {
        const budgetResponse = await ynab.getBudgets();
        setBudgets(budgetResponse.data.budgets);
    };

    const toggleTargetBudget = (budget: ynab.BudgetSummary) => {
        budget.accounts?.forEach((a) => toggleAccount(budget.id, a, true));
        setTarget(budget);
    };

    const loadAccounts = async (id: string) => {
        const accounts = await ynab.getAccounts(id);
        setBudgets(budgets.map((b) => {
            if (b.id === id) {
                if (b.accounts) {
                    b.accounts = null;
                } else {
                    b.accounts = accounts;
                }
            }
            return b;
        }));
    };

    const toggleAccount = (budget_id: string, account: ynab.Account, checked: boolean) => {
        const accts = accounts[budget_id] ?? [];
        if (checked) {
            setAccounts({
                ...accounts,
                [budget_id]: accts.filter((a) => a.id !== account.id),
            });
        } else {
            setAccounts({...accounts, [budget_id]: [...accts, account]});
        }
    };

    const migrate = async () => {
        // First: create all the accounts in target budget that don't already exist
        const targetAccounts = await ynab.getAccounts(target.id);
        const nameToAccount: {[name: string]: ynab.Account} = {}
        targetAccounts.forEach((a) => {
            nameToAccount[a.name] = a;
        });

        for (const [_, accts] of Object.entries(accounts)) {
            for (let a of accts) {
                const name = renames[a.name] || a.name;

                if (!nameToAccount[name]) {
                    a = await ynab.createAccount(target.id, name);
                    nameToAccount[name] = a;
                }
                nameToAccount[a.id] = a;
            }
        }
    };

    return (
        <div className="Migrate">
            <div>
                Copy accounts from one budget to another.
            </div>

            <div>
                Destination Budget?
            </div>

            <Table>
                <tbody>
                    {
                        budgets.map((b) => {
                            return <tr key={b.id}>
                                <td onClick={() => toggleTargetBudget(b)}>
                                    {target?.id === b.id ? `+` : ` `}
                                </td>
                                <td onClick={() => toggleTargetBudget(b)}>{b.name}</td>
                            </tr>
                        })
                    }
                </tbody>
            </Table>

            <div>
                Which account(s) do you want to copy from?
            </div>

            <Table>
                <thead>
                    <tr key="budget table">
                        <td>#</td>
                        <td>Budget name</td>
                        <td></td> 
                    </tr>
                </thead>  
                <tbody>
                    {
                        budgets.filter((b) => b.id !== target?.id).map((b) => {
                            return <tr key={b.id}>
                                <td onClick={() => loadAccounts(b.id)}>
                                    {b.accounts ? `-` : `+`}
                                </td>
                                <td onClick={() => loadAccounts(b.id)}>{b.name}</td>
                                { b.accounts ? 
                                    <td>
                                        <Table>
                                            <thead>
                                                <tr>
                                                    <td></td>
                                                    <td>Accounts</td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    b.accounts.map((a) => {
                                                        const checked = Object.values(accounts).some((accts) => accts.some((tmp) => a.id === tmp.id));
                                                        return <tr key={a.id} onClick={() => toggleAccount(b.id, a, checked)}>
                                                            <td>
                                                                <Checkbox readOnly checked={checked}/>
                                                            </td>
                                                            <td>{a.name}</td>
                                                        </tr>
                                                    })
                                                }
                                            </tbody>
                                        </Table>
                                    </td>
                                : null }
                            </tr>
                        })
                    }
                </tbody>
            </Table>

            { Object.values(accounts).reduce((prev, accts) => accts.length + prev, 0) > 0 ? <div>
                <div>
                    Further updates?
                </div>

                <Table>
                    <thead>
                        <tr>
                            <td>Original Name</td>
                            <td>Destination Name (will be merged into account with identical name)</td>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            Object.entries(accounts).map(([budget_id, accts]) => {
                                return accts.map((a) => {
                                    return <tr key={`taget-${a.id}`}>
                                        <td>{a.name}</td>
                                        <td>
                                            <form onSubmit={e => e.preventDefault()}>
                                                <FormControl
                                                    type="text"
                                                    value={renames[a.id] ?? a.name}
                                                    onChange={(ev) => setRenames({...renames, [a.id]: (ev.target as HTMLTextAreaElement).value})}
                                                />
                                            </form>
                                        </td>
                                    </tr>
                                });
                            })
                        }
                    </tbody>
                </Table>

                <Button onClick={migrate}>
                    Migrate
                </Button>
            </div>
            : null }
        </div>
    );
}