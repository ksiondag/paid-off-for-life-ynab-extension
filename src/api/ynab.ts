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

interface Account {
    id: string;
    name: string;
    balance: number;
};
export const poflAccounts = async (): Promise<Array<Account>> => {
    const budgets = await api.budgets.getBudgets();
    const mainBudget = budgets.data.budgets.find((b) => b.name === 'My Budget');
    const mainAccounts = await api.accounts.getAccounts(mainBudget.id);
    const paidOffForLifeAccounts = mainAccounts.data.accounts.filter((a) => !a.closed && a.type === ynab.Account.TypeEnum.OtherAsset);
    return paidOffForLifeAccounts;
}