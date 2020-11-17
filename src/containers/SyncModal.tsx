import * as React from "react";
import * as ynab from "ynab";

import { Button, Modal } from "react-bootstrap";

import {getBudgets, getAccounts} from "../api/ynab";

interface SyncProps {
    setSyncInProgress: React.Dispatch<React.SetStateAction<boolean>>
}

export default function SyncModal(props: React.PropsWithChildren<SyncProps>) {
    const [assets, setAssets] = React.useState<Array<ynab.Account>>([]);
    const [index, setIndex] = React.useState(0);

    const handleCancel = () => props.setSyncInProgress(false);

    React.useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        const budgets = await getBudgets();
        const mainBudget = budgets.data.budgets.find((b) => b.name === 'Investment Accounts');
        const accounts = (await getAccounts(mainBudget.id)).data.accounts;
        setAssets(accounts);
    };

    return (
        <>
            {assets.length > 0 ?
                assets.map((a, i) => <Modal show={i === index} onHide={handleCancel}>
                    <Modal.Header closeButton>
                        <Modal.Title>{a.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {assets[0].balance}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handleCancel}>
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