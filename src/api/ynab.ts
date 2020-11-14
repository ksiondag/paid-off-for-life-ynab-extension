import * as ynab from "ynab";

let api: ynab.API;

export const login = async ({token}: { token: string }) => {
    let ret: { success: boolean, message: string } = { success: true, message: `` };
    localStorage.setItem(`token`, token);
    api = new ynab.API(token);
    return ret;
};

export const verify = (): boolean => {
    const token = localStorage.getItem(`token`);
    if (!!token && !api) {
        api = new ynab.API(token);
    }
    return !!token;
};

const getBudgets = async (): Promise<ynab.BudgetSummaryResponse> => {
    const localBudgets = localStorage.getItem(`budgets`)

    if (!!localBudgets) {
        return JSON.parse(localBudgets) as ynab.BudgetSummaryResponse;
    }

    const budgets = await api.budgets.getBudgets();
    localStorage.setItem(`budgets`, JSON.stringify(budgets));
    return budgets;
};

const getAccounts = async (budgetId: string): Promise<ynab.AccountsResponse> => {
    const localAccounts = localStorage.getItem(`accounts:${budgetId}`)

    if (!!localAccounts) {
        return JSON.parse(localAccounts) as ynab.AccountsResponse;
    }

    const accounts = await api.accounts.getAccounts(budgetId);
    localStorage.setItem(`accounts:${budgetId}`, JSON.stringify(accounts));
    return accounts;
};

const getMainAccounts = async (): Promise<ynab.AccountsResponse> => {
    const budgets = await getBudgets();
    const mainBudget = budgets.data.budgets.find((b) => b.name === 'My Budget');
    return getAccounts(mainBudget.id);
};

interface Account {
    id: string;
    name: string;
    balance: number;
};
export const poflAccounts = async (): Promise<Array<Account>> => {
    const mainAccounts = await getMainAccounts();
    const paidOffForLifeAccounts = mainAccounts.data.accounts.filter((a) => (!a.closed && a.type === ynab.Account.TypeEnum.OtherAsset) || a.name === `Paid Off for Life`);
    return paidOffForLifeAccounts;
};

export const budgetAccounts = async (): Promise<Array<Account>> => {
    const mainAccounts = await getMainAccounts();
    return mainAccounts.data.accounts.filter((a) => a.on_budget && (a.type === ynab.Account.TypeEnum.CreditCard) || a.name === "Chase Checking");
};