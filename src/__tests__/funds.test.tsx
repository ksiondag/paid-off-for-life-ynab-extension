import * as React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, wait, fireEvent, screen } from "@testing-library/react";

import fundsApi from "../api/funds";
import AppliedRoute from "../components/AppliedRoute";
import Funds from "../containers/Funds";

jest.mock("../api/funds");
jest.mock("../api/token");

const mockFundsApi = fundsApi as jest.Mocked<typeof fundsApi>;

afterEach(() => {
    jest.resetAllMocks()
})


test(`funds render as a table of names and balances`, async () => {
    const appProps = {
        isAuthenticated: false,
        userHasAuthenticated: (): null => null,
    };

    mockFundsApi.get.mockResolvedValue({
        success: true,
        funds: [
            { id: 11, name: `Woo`, balance: 0, balanceDate: `2020-02-08`, userId: 1 },
            { id: 12, name: `Another`, balance: 0, balanceDate: `2020-02-08`, userId: 1 },
            { id: 13, name: `Oh really?`, balance: 250, balanceDate: `2020-02-08`, userId: 1 },
            { id: 14, name: `Nick`, balance: 100000, balanceDate: `2020-02-09`, userId: 1 },
            { id: 15, name: `type a thing`, balance: 0, balanceDate: `2020-02-09`, userId: 1 },
            { id: 16, name: `yas`, balance: 250, balanceDate: `2020-02-09`, userId: 1 }
        ]
    });

    const component = render(
        <MemoryRouter>
            <AppliedRoute component={Funds} appProps={appProps} />
        </MemoryRouter>
    );
    await wait();

    expect(component).toMatchSnapshot();
});

test(`add fund`, async () => {
    const appProps = {
        isAuthenticated: false,
        userHasAuthenticated: (): null => null,
    };

    mockFundsApi.get.mockResolvedValue({
        success: true,
        funds: [
            { id: 11, name: `Woo`, balance: 0, balanceDate: `2020-02-08`, userId: 1 },
        ]
    });

    const component = render(
        <MemoryRouter>
            <AppliedRoute component={Funds} appProps={appProps} />
        </MemoryRouter>
    );
    await wait();

    expect(component).toMatchSnapshot();

    fireEvent.click(screen.getByText(`Add`));
    await wait();
    expect(component).toMatchSnapshot();
});