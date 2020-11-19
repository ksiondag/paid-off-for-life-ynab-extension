import * as React from "react";
import * as ynab from "ynab";

import { Button, FormControl, Modal, Table } from "react-bootstrap";

import {getBudgets, getAccounts} from "../api/ynab";

interface SyncProps {
    setSyncInProgress: React.Dispatch<React.SetStateAction<boolean>>
}

export default function SyncModal(props: React.PropsWithChildren<SyncProps>) {
    const [assets, setAssets] = React.useState<Array<ynab.Account>>([]);
    const [index, setIndex] = React.useState(0);
    const [balance, setBalance] = React.useState(0);

    const handleCancel = () => props.setSyncInProgress(false);

    React.useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        const budgets = await getBudgets();
        const mainBudget = budgets.data.budgets.find((b) => b.name === 'Investment Accounts');
        const accounts = (await getAccounts(mainBudget.id)).data.accounts;
        setAssets(accounts);
        setBalance(accounts[index].balance);
    };

    const constructTransaction = async (i: number) => {
        i += 1
        if (i >= assets.length) {
            return handleCancel();
        } 
        setIndex(i);
        setBalance(assets[i].balance);
    };

    const onChange = (target: HTMLTextAreaElement) => {
        // TODO: needs to be area agnostic (use built-in thing to find character)
        const balanceString = target.value.replace(`,`, ``).replace(`.`, ``);
        setBalance(Number(balanceString) * 10);
    };

    return (
        <>
            {assets.length > 0 ?
                assets.map((a, i) => <Modal key={i} show={i === index} onHide={handleCancel}>
                    <Modal.Header closeButton>
                        <Modal.Title>{a.name} ({i + 1} of {assets.length})</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table>
                            <tbody>
                                <tr>
                                    <td>
                                        <form onSubmit={e => e.preventDefault()}>
                                            <FormControl
                                                type="text"
                                                value={(balance / 1000).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                placeholder="0.00"
                                                onChange={(ev) => onChange(ev.target as HTMLTextAreaElement)}
                                            />
                                        </form>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button onClick={() => constructTransaction(i)}>
                            Skip
                        </Button>
                        <Button onClick={handleCancel}>
                            Save and Continue
                        </Button>
                    </Modal.Footer>
                </Modal>)
            :
                <Modal show={true} onHide={handleCancel}>
                    <Modal.Header closeButton>
                        <Modal.Title>Loading</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Loading assets from YNAB
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={handleCancel}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>
            }
        </>
    );
}