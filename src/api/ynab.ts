import * as ynab from "ynab";

let api: ynab.API;

export type Account = ynab.Account;
export type SaveTransaction = ynab.SaveTransaction;
export type BudgetSummary = ynab.BudgetSummary;

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

export const getBudgets = async (): Promise<ynab.BudgetSummaryResponse> => {
    const localBudgets = localStorage.getItem(`budgets`)

    if (!!localBudgets) {
        return JSON.parse(localBudgets) as ynab.BudgetSummaryResponse;
    }

    const budgets = await api.budgets.getBudgets();
    localStorage.setItem(`budgets`, JSON.stringify(budgets));
    return budgets;
};

export const getAccounts = async (budgetId: string): Promise<ynab.Account[]> => {
    const localAccounts = localStorage.getItem(`accounts:${budgetId}`)

    if (!!localAccounts) {
        return JSON.parse(localAccounts) as ynab.Account[];
    }

    const accounts = (await api.accounts.getAccounts(budgetId)).data.accounts;
    localStorage.setItem(`accounts:${budgetId}`, JSON.stringify(accounts));
    return accounts;
};

const getMainAccounts = async (): Promise<ynab.Account[]> => {
    const budgets = await getBudgets();
    // TODO: no hardcoded budget or account names
    const mainBudget = budgets.data.budgets.find((b) => b.name === 'My Budget');
    return getAccounts(mainBudget.id);
};

export const poflAccounts = async (): Promise<Array<Account>> => {
    const mainAccounts = await getMainAccounts();
    const paidOffForLifeAccounts = mainAccounts.filter((a) => (!a.closed && a.type === ynab.Account.TypeEnum.OtherAsset) || a.name === `Paid Off for Life` || a.name === `Index Budgeted`);
    return paidOffForLifeAccounts;
};

export const assetAccounts = async (): Promise<Array<Account>> => {
    const budgets = await getBudgets();
    // TODO: no hardcoded budget or account names
    const mainBudget = budgets.data.budgets.find((b) => b.name === 'Investment Accounts');
    return (await getAccounts(mainBudget.id)).filter((a) => a.type === ynab.Account.TypeEnum.OtherAsset);
}

export const budgetAccounts = async (): Promise<Array<Account>> => {
    const mainAccounts = await getMainAccounts();
    return mainAccounts.filter((a) => a.on_budget && (a.type === ynab.Account.TypeEnum.CreditCard) || a.name === "Chase Checking");
};

export const getTransactions = async (budget_id:string, account_id: string): Promise<ynab.TransactionDetail[]> => {
    const localTransactions = localStorage.getItem(`transactions:${budget_id}:${account_id}`)

    if (!!localTransactions) {
        return JSON.parse(localTransactions) as ynab.TransactionDetail[];
    }

    const transactions = (await api.transactions.getTransactionsByAccount(budget_id, account_id)).data.transactions;
    localStorage.setItem(`transactions:${budget_id}:${account_id}`, JSON.stringify(transactions));
    return transactions;
};

export const createTransactions = async (budget_id: string, {transactions}: {transactions: Array<Omit<ynab.SaveTransaction, "date"> | ynab.SaveTransaction>}) => {
    await api.transactions.createTransactions(budget_id, {transactions: transactions.map((t) => ({
        date: ynab.utils.getCurrentDateInISOFormat(),
        ...t,
    }))});
    localStorage.removeItem(`accounts:${budget_id}`);
};

const getCategories = async (budget_id: string): Promise<ynab.CategoryGroupWithCategories[]> => {
    const localCategories = localStorage.getItem(`categories:${budget_id}`)

    if (!!localCategories) {
        return JSON.parse(localCategories) as ynab.CategoryGroupWithCategories[];
    }

    const categories = (await api.categories.getCategories(budget_id)).data.category_groups;
    localStorage.setItem(`categories:${budget_id}`, JSON.stringify(categories));
    return categories;
};

const calculateSubtransactions = (amount: number, account: Account, categories: ynab.CategoryGroupWithCategories[]): ynab.SaveSubTransaction[] => {
    const accountCategories = categories.flatMap((group) => group.categories.filter((category) => category.note?.includes(account.name)));
    if (accountCategories.length === 0) {
        return [];
    }
    const overflowCategory = accountCategories.find((c) => c.note?.includes(`Overflow`));
    const categoryObj = overflowCategory ? {category_id: overflowCategory.id} : {};

    const interest = 1 - account.balance / (account.balance + amount);
    let delta = amount;
    const subtransactions: ynab.SaveSubTransaction[] = [{
        ...categoryObj,
        amount: 0,
    }, ...accountCategories.filter((c) => c.id !== overflowCategory.id && c.note?.includes(`Compound`)).map((c) => {
        const amount = Math.round(c.balance * interest / 10) * 10;
        delta -= amount;
        return {
            category_id: c.id,
            amount,
        };
    })];
    subtransactions[0].amount += delta;
    return subtransactions.filter((s) => s.amount > 0);
};

// TODO: Break this script up and make it an interactive FE setup
export const syncWithRealAccounts = async () => {
    const budgets = await getBudgets();

    // TODO: no hardcoded budget or account names
    const mainBudget = budgets.data.budgets.find((b) => b.name === 'My Budget');
    const mainAccounts = await getAccounts(mainBudget.id);

    // TODO: no hardcoded budget or account names
    const investmentBudget = budgets.data.budgets.find((b) => b.name === 'Investment Accounts');
    const investmentAccounts = await getAccounts(investmentBudget.id);

    const paidOffForLifeAccounts = mainAccounts.filter((a) => !a.closed && (a.type === ynab.Account.TypeEnum.OtherAsset || a.name === `Paid Off for Life` || a.name === `Index Budgeted`));
    const paidOffForLifeTotal = paidOffForLifeAccounts.reduce((prev, a) => prev + a.balance, 0);
    const investmentsTotal = investmentAccounts.filter((a) => a.type === ynab.Account.TypeEnum.OtherAsset).reduce((prev, a) => prev + a.balance, 0);
    let delta = investmentsTotal - paidOffForLifeTotal;

    if (delta === 0) {
        return;
    }

    const interest = 1 - paidOffForLifeTotal/investmentsTotal;
    const categories = await getCategories(mainBudget.id);
    const transactions = paidOffForLifeAccounts.map((a): Omit<ynab.SaveTransaction, "date"> => {
        const amount =  Math.round(a.balance * interest / 10) * 10;
        delta -= amount;
        const subtransactions = calculateSubtransactions(amount, a, categories);
        const subtransactionObj = subtransactions.length > 0 ? {subtransactions} : {};
        return {
            account_id: a.id,
            amount,
            payee_name: "Market updates",
            ...subtransactionObj,
        };
    }).filter((t) => t.amount > 0);

    transactions[0].amount += delta;
    if (transactions[0].subtransactions) {
        transactions[0].subtransactions[0].amount += delta;
    }

    createTransactions(mainBudget.id, {transactions});
};

export const toString = (balance: number): string => {
    return (balance/1000).toLocaleString(undefined, {minimumFractionDigits: 2});
};

export const toNumber = (balance: string): number => {
    // TODO: needs to be area agnostic (use built-in thing to find character)
    return Number(balance.replace(/,/g, ``).replace(/\./g, ``)) * 10;
};

export const createAccount = async (budget_id: string, account_name: string) => {
    const response = await api.accounts.createAccount(budget_id, {
        account: {
            name: account_name,
            type: ynab.Account.TypeEnum.OtherAsset as ynab.SaveAccount.TypeEnum,
            balance: 0,
        },
    });

    return response.data.account;
};