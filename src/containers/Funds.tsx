import * as React from "react";

import { Table, ButtonToolbar, Button, FormControl } from "react-bootstrap";

import { RouterAppProps } from "../interfaces";

import AddFund from "./funds/AddFund";

import "./Funds.css";
import {poflAccounts} from "../api/ynab";

interface Fund {
    id: number;
}

export default function Funds(props: React.PropsWithChildren<RouterAppProps>) {
    const [funds, setFunds] = React.useState([]);
    const [addFund, setAddFund] = React.useState(false);

    React.useEffect(() => {
        loadFunds();
    }, []);

    const loadFunds = async () => {
        setFunds(await poflAccounts());
        console.log(`Load funds!`);
    };

    return (
        <div className="Funds">
            <Table>
                <thead>
                    <tr>
                        <th>Fund Name</th>
                        <th>Balance</th>
                        {/* <th>
                            <ButtonToolbar>
                                <Button onClick={() => setAddFund(true)}>Add</Button>
                            </ButtonToolbar>
                        </th> */}
                    </tr>
                    {/* {addFund
                        ?
                        <AddFund setAddFund={setAddFund} saveFund={saveFund} />
                        :
                        <></>
                    } */}
                    {
                        funds.map(({ id, name, balance }) => {
                            return <tr key={id}>
                                <td>{name}</td>
                                <td>{balance}</td>
                                {/* <td>
                                    <ButtonToolbar>
                                        <Button bsStyle="danger" onClick={() => deleteFund(id)}>Delete</Button>
                                    </ButtonToolbar>
                                </td> */}
                            </tr>
                        })
                    }
                </thead>
            </Table>
        </div>
    );
}