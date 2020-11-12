import * as React from "react";
import { FormControl, ButtonToolbar, Button } from "react-bootstrap";

interface AddFundProps {
    setAddFund: React.Dispatch<React.SetStateAction<boolean>>;
    saveFund: (name: string, balance: number) => Promise<void>;
};

export default function AddFund(props: React.PropsWithChildren<AddFundProps>) {
    const [fundName, setFundName] = React.useState("");
    const [balance, setBalance] = React.useState(0.00);

    const handleSubmit = (event: React.FormEvent | React.MouseEvent<Button, MouseEvent>) => {
        event.preventDefault();
        props.saveFund(fundName, balance);
    };

    return (
        <tr key="add">
            <td>
                <form onSubmit={handleSubmit}>
                    <FormControl
                        autoFocus
                        value={fundName}
                        type="text"
                        placeholder="Fund name"
                        onChange={e => setFundName((e.target as HTMLTextAreaElement).value)}
                    />
                </form>
            </td>
            <td>
                <form onSubmit={handleSubmit}>
                    <FormControl
                        type="text"
                        value={balance}
                        placeholder="0.00"
                        onChange={e => setBalance(parseFloat((e.target as HTMLTextAreaElement).value))}
                    />
                </form>
            </td>
            <td>
                <ButtonToolbar>
                    <Button onClick={handleSubmit}>Save</Button>
                    <Button onClick={() => props.setAddFund(false)}>Cancel</Button>
                </ButtonToolbar>
            </td>
        </tr>
    );
}