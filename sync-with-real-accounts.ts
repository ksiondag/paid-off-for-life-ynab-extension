import * as ynab from "ynab";

import {token} from "./account-token"

async function syncWithRealAccounts() {
    const api = new ynab.API(token);
    const budgets = await api.budgets.getBudgets();

    const mainBudget = budgets.data.budgets.find((b) => b.name === 'My Budget');
    const mainAccounts = await api.accounts.getAccounts(mainBudget.id);

    const investmentBudget = budgets.data.budgets.find((b) => b.name === 'Investment Accounts');
    const investmentAccounts = await api.accounts.getAccounts(investmentBudget.id);

    const paidOffForLifeAllocted = mainAccounts.data.accounts.find((a) => a.name === 'Paid Off for Life').balance;
    const paidOffForLifeAccounts = mainAccounts.data.accounts.filter((a) => !a.closed && a.type === 'otherAsset');
    const paidOffForLifeTotal = paidOffForLifeAccounts.reduce((prev, a) => prev + a.balance, 0) + paidOffForLifeAllocted;
    const investmentsTotal = investmentAccounts.data.accounts.filter((a) => a.type === 'otherAsset').reduce((prev, a) => prev + a.balance, 0);
    let delta = investmentsTotal - paidOffForLifeTotal;

    if (delta === 0) {
        return;
    }

    const interest = 1 - (paidOffForLifeTotal - paidOffForLifeAllocted)/(investmentsTotal - paidOffForLifeAllocted);

    const transactions = paidOffForLifeAccounts.map((a) => {
        const amount =  Math.round(a.balance * interest / 10) * 10;
        delta -= amount;
        return {
            account_id: a.id,
            date: "2020-11-12",
            amount,
            payee_name: "Market updates",
            // cleared: "cleared",
        };
    });

    transactions[0].amount += delta;

    api.transactions.createTransactions(mainBudget.id, {transactions});
}

syncWithRealAccounts();