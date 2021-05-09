import * as React from "react";
import { Table } from "react-bootstrap";
import { AppProps } from "../interfaces";

import * as ynab from "../api/ynab";

export default function FIDebt(props: React.PropsWithChildren<AppProps>) {
    const [categories, setCategories] = React.useState<Array<ynab.Category>>([]);

    React.useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        const budgets = await ynab.getBudgets();

        // TODO: no hardcoded budget or account names
        const mainBudget = budgets.data.budgets.find((b) => b.name === 'My Budget');
        const groups = await ynab.getCategories(mainBudget.id);
        const categories = groups
            .filter((group) => !["Savings", "Paycheck Deductions"].includes(group.name))
            .flatMap((group) => group.categories.filter((category) => category.budgeted > 0))
            .sort((a, b) => a.budgeted - b.budgeted);

        setCategories(categories);
    };


    return (
        <div className="FIDebt">
            <div>
                Regular spending that isn't already paid off for life is "FI Debt".
                Recommended to pay off the smaller debts first, but try to eliminate
                spending wherever you can!
            </div>

            <Table>
                <thead>
                    <tr key="categories header">
                        <th>Category</th>
                        <th style={{ textAlign: "right" }}>Monthly Allocation {categories.length > 0 ? `($${(categories.reduce((prev, { budgeted }) => prev + budgeted, 0) / 1000).toLocaleString('en', { minimumFractionDigits: 2 })})` : null}</th>
                        <th style={{ textAlign: "right" }}>FI Debt {categories.length > 0 ? `($${(categories.reduce((prev, { budgeted }) => prev + budgeted * 300, 0) / 1000).toLocaleString('en', { minimumFractionDigits: 2 })})` : null}</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        categories.map(({ id, name, budgeted, note }) => {
                            return <tr key={id}>
                                <td>{name}</td>
                                <td style={{ textAlign: "right" }}>${(budgeted / 1000).toLocaleString('en', { minimumFractionDigits: 2 })}</td>
                                <td style={{ textAlign: "right" }}>${(budgeted * 300 / 1000).toLocaleString('en', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        })
                    }
                </tbody>
            </Table>
        </div>
    );
}